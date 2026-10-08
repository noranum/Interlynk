Interlynk — Decentralized Escrow Payment DApp

A decentralized escrow payment application built using Solidity, React, TypeScript, ethers.js, and MetaMask, deployed on the Ethereum Sepolia Testnet.

Interlynk allows two parties to create payment agreements, lock ERC-20 test tokens in a smart contract, submit completed work, and release payments only after the payer approves the work.

This project was developed as a university blockchain assignment to demonstrate smart contract deployment, decentralized application development, and real blockchain transactions.

1. Project Overview

Traditional online payments often require one party to trust another. For example, freelancers may worry about not receiving payment after completing work, while clients may worry about paying before receiving the agreed services.

Interlynk addresses this problem through blockchain-based escrow payments.

Instead of transferring payment directly to the recipient, the payer deposits tokens into an Ethereum smart contract. The tokens remain locked until the recipient submits the completed work and the payer authorizes the release.

This creates a transparent payment process without requiring a traditional escrow intermediary.

2. Main Features

- MetaMask Wallet Integration: Connect an Ethereum wallet and interact with the DApp on Sepolia.
- Create Escrow Agreements: Define the recipient, payment amount, deadline, and release conditions.
- ERC-20 Token Approval: Authorize the escrow smart contract to transfer the specified iTHB amount.
- Token Deposits: Deposit iTHB tokens into the escrow smart contract.
- Work Submission: Allow recipients to submit completion notes or deliverable references.
- Conditional Payment Release: Allow payers to approve the completed work and release escrowed tokens.
- Escrow Dashboard: View agreements, payment amounts, and agreement statuses.
- Transaction History: Review recorded escrow activities and open transaction links on Sepolia Etherscan.

3. Technology Stack

| Technology | Purpose |
|---|---|
| Solidity | Smart contract development |
| Ethereum Sepolia | Blockchain test network |
| ERC-20 | iTHB payment token standard |
| React | Frontend user interface |
| TypeScript | Frontend application logic |
| ethers.js | Ethereum blockchain interactions |
| MetaMask | Wallet connection and transaction approval |
| Tailwind CSS | Website styling |
| Sepolia Etherscan | Blockchain transaction verification |

4. How Interlynk Works

Step 1 — Create Escrow Agreement

The payer connects their MetaMask wallet and creates an escrow agreement containing:

- Recipient's Ethereum wallet address
- Payment amount in iTHB
- Agreement description and release conditions
- Completion deadline

The escrow agreement is created through a smart contract transaction on Ethereum Sepolia.

Step 2 — Approve iTHB Tokens

The payer approves the escrow smart contract to spend the required amount of iTHB tokens.

This authorization follows the ERC-20 token standard.

Step 3 — Deposit Tokens

The payer deposits iTHB tokens into the escrow smart contract.

Once deposited, the tokens are locked and cannot be transferred through the normal payment workflow until the release conditions are satisfied.

Step 4 — Submit Completed Work

The recipient connects their MetaMask wallet and submits a completion note or deliverable reference.

The submission is recorded through a Sepolia smart contract transaction.

Step 5 — Approve and Release Payment

The payer reviews the submitted work.

If satisfied, the payer approves the work and confirms the payment release using MetaMask.

The escrow smart contract transfers the locked iTHB tokens to the recipient's wallet.

The completed transaction can be verified using Sepolia Etherscan.

5. Smart Contract Architecture

Interlynk uses two types of smart contracts:

Interlynk Escrow Contract

Manages the payment agreement lifecycle, including:

- Agreement creation
- Token deposits
- Locked escrow funds
- Work submission
- Conditional payment release

iTHB ERC-20 Token Contract

iTHB (Interlynk Thai Baht) is a test ERC-20 token used to demonstrate tokenized payments.

For demonstration purposes:

1 iTHB = ฿1 (illustrative value only)

iTHB is not real Thai baht, is not officially baht-backed, and has no guaranteed monetary value.

All demonstrated token transfers take place on Ethereum Sepolia.

Deployed Contract Addresses

Network: Ethereum Sepolia Testnet

Interlynk Escrow Contract:  
`0xCC8f82718157f4685bb93DD29df328beB4950C28`

iTHB Token Contract:  
`0x0C0b35b0950Dab7B2D7C413Bd8C0EBeEb52AA2d1`

Contract deployment and transaction details can be inspected at:

https://sepolia.etherscan.io/

6. Blockchain Integration

The frontend communicates with Ethereum through ethers.js and MetaMask.

Transaction flow:

1. The user initiates an action through the React website.
2. MetaMask requests transaction confirmation.
3. The transaction is submitted to the deployed Solidity smart contract.
4. Ethereum Sepolia processes the transaction.
5. The frontend waits for confirmation and updates the displayed agreement status.

The main contract functions used by the frontend include:

| Function | Description |
|---|---|
| `createEscrow()` | Creates a new escrow agreement |
| `approve()` | Authorizes ERC-20 token spending |
| `depositTokens()` | Transfers tokens into escrow |
| `markWorkSubmitted()` | Records submitted work |
| `releaseFunds()` | Releases escrowed tokens to the recipient |

7. Installation and Setup

Requirements

- Node.js and npm
- MetaMask browser extension
- Ethereum Sepolia test ETH for gas fees
- Test iTHB tokens

Clone the Repository

```bash
git clone [https://github.com/noranum/Interlynk.git]
```

```bash
cd interlynk-escrow-dapp
```

Install Dependencies

```bash
npm install
```

Configure Contracts

Ensure the frontend contract configuration contains the correct deployed Sepolia contract addresses and ABI definitions.

The existing project uses contract configuration in:

`src/config/contracts.ts`

If environment variables are required, configure them according to the project's example environment file.

Never commit private keys, wallet recovery phrases, or sensitive API credentials.

Run the Website

```bash
npm run dev
```

Open the local URL displayed by the development server.

Connect MetaMask, select Ethereum Sepolia, and interact with the application.

8. Why Blockchain?

Blockchain is used because escrow payments benefit from transparent, verifiable, and programmable transaction execution.

Transparency: Participants can inspect relevant transactions on Ethereum Sepolia.

Programmable payments: Smart contracts enforce payment flows and authorized actions.

Reduced reliance on intermediaries: Tokens can be held and transferred by deployed contract logic instead of a traditional escrow provider.

Traceability: Confirmed blockchain transactions generate publicly verifiable transaction hashes.

Wallet authorization: Users approve transactions using their own MetaMask wallets.

9. On-Chain and Off-Chain Data

On-Chain

The smart contract handles essential agreement and payment information, including:

- Payer and recipient blockchain addresses
- Escrow amount
- Agreement release condition
- Deadline
- Escrow funding and release state
- Work submission reference
- Token transfers and transaction events

Off-Chain

The React frontend also manages application information, including:

- Agreement display names
- Additional descriptions
- Interface preferences
- Local activity history
- User-friendly agreement summaries

The current frontend uses browser local storage for some agreement details and activity records.

10. Limitations

Interlynk is an educational prototype and is not intended for production financial use.

Current limitations include:

- The application runs on Sepolia rather than Ethereum Mainnet.
- iTHB tokens have no real monetary value.
- Ethereum transactions require test ETH for gas fees.
- Some frontend information is stored locally rather than synchronized directly from the blockchain.
- Work approval requires a payer decision and is not independently verified.
- Dispute resolution, refunds, and production security controls are not fully implemented.
- The smart contracts have not undergone a professional security audit.

11. Testing

The application's core escrow workflow was tested using MetaMask accounts connected to Ethereum Sepolia.

The tested workflow included:

1. Creating an escrow agreement.
2. Approving ERC-20 iTHB tokens.
3. Depositing tokens into escrow.
4. Submitting completed work from the recipient account.
5. Releasing escrowed tokens from the payer account.
6. Viewing the payment release transaction on Sepolia Etherscan.

Testing demonstrated the interaction between the React frontend, MetaMask, Solidity smart contracts, and the Ethereum Sepolia blockchain.

12. Future Improvements

Possible future development includes:

- Blockchain-based agreement synchronization
- Improved dispute resolution and refund mechanisms
- Notification systems for escrow participants
- Enhanced smart contract security
- Support for additional ERC-20 payment tokens
- Improved mobile responsiveness and user experience

13. Disclaimer

Interlynk is developed solely for educational and demonstration purposes.

All transactions use Ethereum Sepolia testnet assets. iTHB is a fictional test token and is not an official stablecoin, licensed payment instrument, or representation of actual Thai baht.

Project: Interlynk — Decentralized Escrow Payment DApp  
Network: Ethereum Sepolia  
Purpose: University blockchain development assignment
