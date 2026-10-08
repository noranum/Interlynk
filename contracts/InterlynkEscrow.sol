// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract InterlynkEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    enum EscrowStatus {
        AwaitingDeposit, // 0
        FundsLocked, // 1
        WorkSubmitted, // 2
        Released, // 3
        Cancelled, // 4
        Refunded // 5
    }

    struct Escrow {
        address payer;
        address recipient;
        uint256 amount;
        EscrowStatus status;
        uint256 deadline;
        string releaseCondition;
        string deliverableUri;
    }

    uint256 public escrowCount;

    mapping(uint256 => Escrow) private escrows;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed payer,
        address indexed recipient,
        uint256 amount
    );

    event FundsDeposited(uint256 indexed escrowId, uint256 amount);

    event WorkSubmitted(uint256 indexed escrowId, string deliverableUri);

    event FundsReleased(
        uint256 indexed escrowId,
        address indexed recipient,
        uint256 amount
    );

    event EscrowCancelled(uint256 indexed escrowId);

    event EscrowRefunded(
        uint256 indexed escrowId,
        address indexed payer,
        uint256 amount
    );

    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }

    // ---------------------------------------------------------
    // CREATE ESCROW
    // ---------------------------------------------------------

    function createEscrow(
        address recipient,
        uint256 amount,
        string memory releaseCondition,
        uint256 deadline
    ) external returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Payer cannot be recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in future");
        require(bytes(releaseCondition).length > 0, "Condition required");

        escrowCount++;

        escrows[escrowCount] = Escrow({
            payer: msg.sender,
            recipient: recipient,
            amount: amount,
            status: EscrowStatus.AwaitingDeposit,
            deadline: deadline,
            releaseCondition: releaseCondition,
            deliverableUri: ""
        });

        emit EscrowCreated(escrowCount, msg.sender, recipient, amount);

        return escrowCount;
    }

    // ---------------------------------------------------------
    // DEPOSIT iTHB
    // ---------------------------------------------------------

    function depositTokens(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.payer != address(0), "Escrow does not exist");
        require(msg.sender == escrow.payer, "Only payer can deposit");
        require(
            escrow.status == EscrowStatus.AwaitingDeposit,
            "Escrow not awaiting deposit"
        );
        require(block.timestamp < escrow.deadline, "Escrow expired");

        escrow.status = EscrowStatus.FundsLocked;

        token.safeTransferFrom(msg.sender, address(this), escrow.amount);

        emit FundsDeposited(escrowId, escrow.amount);
    }

    // ---------------------------------------------------------
    // RECIPIENT SUBMITS WORK
    // ---------------------------------------------------------

    function markWorkSubmitted(
        uint256 escrowId,
        string memory deliverableUri
    ) external {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.payer != address(0), "Escrow does not exist");
        require(
            msg.sender == escrow.recipient,
            "Only recipient can submit work"
        );
        require(
            escrow.status == EscrowStatus.FundsLocked,
            "Funds are not locked"
        );

        escrow.deliverableUri = deliverableUri;
        escrow.status = EscrowStatus.WorkSubmitted;

        emit WorkSubmitted(escrowId, deliverableUri);
    }

    // ---------------------------------------------------------
    // PAYER APPROVES AND RELEASES
    // ---------------------------------------------------------

    function releaseFunds(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.payer != address(0), "Escrow does not exist");
        require(msg.sender == escrow.payer, "Only payer can release");
        require(
            escrow.status == EscrowStatus.WorkSubmitted,
            "Work has not been submitted"
        );

        escrow.status = EscrowStatus.Released;

        token.safeTransfer(escrow.recipient, escrow.amount);

        emit FundsReleased(escrowId, escrow.recipient, escrow.amount);
    }

    // ---------------------------------------------------------
    // CANCEL
    // ---------------------------------------------------------

    function cancelEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.payer != address(0), "Escrow does not exist");
        require(msg.sender == escrow.payer, "Only payer can cancel");
        require(
            escrow.status != EscrowStatus.Released &&
                escrow.status != EscrowStatus.Cancelled &&
                escrow.status != EscrowStatus.Refunded,
            "Escrow already completed"
        );

        bool hasDeposit = escrow.status == EscrowStatus.FundsLocked ||
            escrow.status == EscrowStatus.WorkSubmitted;

        escrow.status = EscrowStatus.Cancelled;

        if (hasDeposit) {
            token.safeTransfer(escrow.payer, escrow.amount);
        }

        emit EscrowCancelled(escrowId);
    }

    // ---------------------------------------------------------
    // REFUND AFTER DEADLINE
    // ---------------------------------------------------------

    function refundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.payer != address(0), "Escrow does not exist");
        require(msg.sender == escrow.payer, "Only payer can refund");
        require(block.timestamp >= escrow.deadline, "Deadline not reached");

        require(
            escrow.status == EscrowStatus.FundsLocked ||
                escrow.status == EscrowStatus.WorkSubmitted,
            "Escrow cannot be refunded"
        );

        escrow.status = EscrowStatus.Refunded;

        token.safeTransfer(escrow.payer, escrow.amount);

        emit EscrowRefunded(escrowId, escrow.payer, escrow.amount);
    }

    // ---------------------------------------------------------
    // READ ESCROW
    // ---------------------------------------------------------

    function getEscrow(
        uint256 escrowId
    )
        external
        view
        returns (
            address payer,
            address recipient,
            uint256 amount,
            uint8 status,
            uint256 deadline,
            string memory releaseCondition
        )
    {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.payer != address(0), "Escrow does not exist");

        return (
            escrow.payer,
            escrow.recipient,
            escrow.amount,
            uint8(escrow.status),
            escrow.deadline,
            escrow.releaseCondition
        );
    }

    function getDeliverable(
        uint256 escrowId
    ) external view returns (string memory) {
        return escrows[escrowId].deliverableUri;
    }
}
