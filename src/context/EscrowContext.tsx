import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

import type { EscrowAgreement, EscrowActivity, CreateEscrowFormInput } from '../types/escrow';
import { useWallet, DEMO_PAYER_ADDRESS, DEMO_RECIPIENT_ADDRESS } from '../hooks/useWallet';
import {
  CONTRACT_ADDRESSES,
  ESCROW_ABI,
} from '../config/contracts';

interface EscrowContextType {
  agreements: EscrowAgreement[];
  activities: EscrowActivity[];
  createAgreement: (data: CreateEscrowFormInput) => Promise<string>;
  approveToken: (agreementId: string) => Promise<string>;
  depositFunds: (agreementId: string) => Promise<string>;
  submitWork: (agreementId: string, note: string, link?: string) => Promise<void>;
  releaseFunds: (agreementId: string) => Promise<string>;
  requestChanges: (agreementId: string, feedback: string) => Promise<void>;
  cancelAgreement: (agreementId: string) => Promise<string>;
  getAgreement: (id: string) => EscrowAgreement | undefined;
  resetDemoData: () => void;
}

const INITIAL_AGREEMENTS: EscrowAgreement[] = [
  {
    id: 'escrow-101',
    name: 'Logo Design',
    description: 'Payment for designing the Interlynk company logo and brand guide.',
    releaseCondition: 'Final logo files must be delivered and approved by the payer.',
    payerAddress: DEMO_PAYER_ADDRESS,
    recipientAddress: DEMO_RECIPIENT_ADDRESS,
    amount: 5000,
    deadline: '2026-10-15',
    createdAt: '2026-10-07T09:30:00Z',
    status: 'awaiting_approval',
    tokenApproved: true,
    fundsDeposited: true,
    approvalTxHash: '0x9a4b82c16301d2938a7c293701824b6182c478a192837462810a9f8293741029',
    depositTxHash: '0x7b2f91a45c820194857b28491829384729182746192837462819283746192837',
    submittedDeliverable: {
      note: 'All final logo deliverables uploaded: vector AI files, SVGs, dark/light transparent PNGs, and the brand color typography guidelines PDF.',
      link: 'https://drive.google.com/drive/folders/interlynk-brand-assets',
      submittedAt: '2026-10-07T11:15:00Z',
    },
    updatedAt: '2026-10-07T11:15:00Z',
  },
  {
    id: 'escrow-102',
    name: 'Website Development',
    description: 'Frontend development of the Interlynk decentralized escrow web application.',
    releaseCondition: 'Full responsive dashboard, MetaMask connection, and escrow lifecycle completed and reviewed.',
    payerAddress: DEMO_PAYER_ADDRESS,
    recipientAddress: '0x92Db2170Fc671f5B2881E32A028d7B9f76a618Fe',
    amount: 2500,
    deadline: '2026-10-24',
    createdAt: '2026-10-06T14:00:00Z',
    status: 'funds_locked',
    tokenApproved: true,
    fundsDeposited: true,
    approvalTxHash: '0x3c71a9e81b2c4d92837461928374619283746192837461928374619283746192',
    depositTxHash: '0x1d8a4f91e0a29384719283746192837461928374619283746192837461928374',
    updatedAt: '2026-10-06T14:45:00Z',
  },
  {
    id: 'escrow-103',
    name: 'Social Media Campaign',
    description: 'Launch announcement campaign across Twitter/X and LinkedIn with branded graphics.',
    releaseCondition: 'Publish 5 promotional posts across social channels with at least 5,000 combined impressions.',
    payerAddress: DEMO_PAYER_ADDRESS,
    recipientAddress: '0x3fA190bA554A0155b4618e7e2Fe6d2E761899c12',
    amount: 1500,
    deadline: '2026-10-05',
    createdAt: '2026-10-01T10:00:00Z',
    status: 'released',
    tokenApproved: true,
    fundsDeposited: true,
    releaseTxHash: '0x89e5a1b3c4f72d9e01824b6182c478a192837462810a9f8293740172649b81a2',
    submittedDeliverable: {
      note: 'All 5 social campaign posts published with analytics reports attached showing 8,240 impressions.',
      link: 'https://interlynk.io/reports/social-campaign-oct2026.pdf',
      submittedAt: '2026-10-04T16:00:00Z',
    },
    updatedAt: '2026-10-05T12:00:00Z',
  },
];

const INITIAL_ACTIVITIES: EscrowActivity[] = [
  {
    id: 'act-1',
    escrowId: 'escrow-101',
    escrowName: 'Logo Design',
    action: 'Work Submitted for Review',
    actorAddress: DEMO_RECIPIENT_ADDRESS,
    amount: 5000,
    status: 'awaiting_approval',
    timestamp: '2026-10-07T11:15:00Z',
    details: 'Deliverables uploaded: Vector AI files and brand guide PDF.',
  },
  {
    id: 'act-2',
    escrowId: 'escrow-101',
    escrowName: 'Logo Design',
    action: 'iTHB Deposited into Escrow',
    actorAddress: DEMO_PAYER_ADDRESS,
    amount: 5000,
    status: 'funds_locked',
    timestamp: '2026-10-07T09:35:00Z',
    txHash: '0x7b2f91a45c820194857b28491829384729182746192837462819283746192837',
    details: '5,000 iTHB successfully locked in Interlynk Escrow contract.',
  },
  {
    id: 'act-3',
    escrowId: 'escrow-102',
    escrowName: 'Website Development',
    action: 'Funds Deposited',
    actorAddress: DEMO_PAYER_ADDRESS,
    amount: 2500,
    status: 'funds_locked',
    timestamp: '2026-10-06T14:45:00Z',
    txHash: '0x1d8a4f91e0a29384719283746192837461928374619283746192837461928374',
    details: '2,500 iTHB locked in escrow contract. Recipient notified to start work.',
  },
  {
    id: 'act-4',
    escrowId: 'escrow-103',
    escrowName: 'Social Media Campaign',
    action: 'Payment Released',
    actorAddress: DEMO_PAYER_ADDRESS,
    amount: 1500,
    status: 'released',
    timestamp: '2026-10-05T12:00:00Z',
    txHash: '0x89e5a1b3c4f72d9e01824b6182c478a192837462810a9f8293740172649b81a2',
    details: 'Payer approved completed work. 1,500 iTHB transferred to recipient.',
  },
];

const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

export const EscrowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useWallet();

  const [agreements, setAgreements] = useState<EscrowAgreement[]>(() => {
    const saved = localStorage.getItem('interlynk_agreements');
    return saved ? JSON.parse(saved) : [];
  });

  const [activities, setActivities] = useState<EscrowActivity[]>(() => {
    const saved = localStorage.getItem('interlynk_activities');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('interlynk_agreements', JSON.stringify(agreements));
  }, [agreements]);

  useEffect(() => {
    localStorage.setItem('interlynk_activities', JSON.stringify(activities));
  }, [activities]);

  const resetDemoData = () => {
    setAgreements(INITIAL_AGREEMENTS);
    setActivities(INITIAL_ACTIVITIES);
    localStorage.removeItem('interlynk_agreements');
    localStorage.removeItem('interlynk_activities');
  };

  const getAgreement = (id: string) => {
    return agreements.find((a) => a.id === id);
  };

  const createAgreement = async (data: CreateEscrowFormInput): Promise<string> => {
    if (!address) {
      throw new Error('Please connect MetaMask before creating an escrow agreement.');
    }

    if (!window.ethereum) {
      throw new Error('MetaMask is not available.');
    }

    const parsedAmount = parseFloat(data.amount);

    if (!parsedAmount || parsedAmount <= 0) {
      throw new Error('Escrow amount must be greater than 0.');
    }

    // Connect to MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Connect to the real Interlynk Escrow contract
    const escrowContract = new ethers.Contract(
      CONTRACT_ADDRESSES.interlynkEscrow,
      ESCROW_ABI,
      signer
    );

    // iTHB uses 18 decimals
    const amountInWei = ethers.parseUnits(
      parsedAmount.toString(),
      18
    );

    // Convert selected deadline into Unix timestamp
    const deadlineTimestamp = Math.floor(
      new Date(`${data.deadline}T23:59:59`).getTime() / 1000
    );

    // CREATE REAL ESCROW ON SEPOLIA
    const tx = await escrowContract.createEscrow(
      data.recipientAddress.trim(),
      amountInWei,
      data.releaseCondition,
      deadlineTimestamp
    );

    // Wait for MetaMask transaction to be confirmed
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Escrow transaction was not confirmed.');
    }

    // Find the EscrowCreated event to get the real blockchain escrow ID
    let blockchainEscrowId: string | null = null;

    for (const log of receipt.logs) {
      try {
        const parsedLog = escrowContract.interface.parseLog(log);

        if (parsedLog?.name === 'EscrowCreated') {
          blockchainEscrowId = parsedLog.args.escrowId.toString();
          break;
        }
      } catch {
        // Ignore unrelated logs
      }
    }

    if (!blockchainEscrowId) {
      throw new Error('Could not find the created escrow ID.');
    }

    const now = new Date().toISOString();

    // Save a local copy for the current frontend
    const newAgreement: EscrowAgreement = {
      id: blockchainEscrowId,
      name: data.name,
      description: data.description,
      releaseCondition: data.releaseCondition,
      payerAddress: address,
      recipientAddress: data.recipientAddress.trim(),
      amount: parsedAmount,
      deadline: data.deadline,
      createdAt: now,
      status: 'awaiting_token_approval',
      tokenApproved: false,
      fundsDeposited: false,
      updatedAt: now,
    };

    const newActivity: EscrowActivity = {
      id: `act-${Date.now()}`,
      escrowId: blockchainEscrowId,
      escrowName: data.name,
      action: 'Agreement Created',
      actorAddress: address,
      amount: parsedAmount,
      status: 'awaiting_token_approval',
      timestamp: now,
      txHash: tx.hash,
      details: `Escrow agreement created on Sepolia for ${parsedAmount.toLocaleString()} iTHB.`,
    };

    setAgreements((prev) => [newAgreement, ...prev]);
    setActivities((prev) => [newActivity, ...prev]);

    return blockchainEscrowId;
  };

  const approveToken = async (agreementId: string): Promise<string> => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not available.');
    }

    const agreement = agreements.find((a) => a.id === agreementId);

    if (!agreement) {
      throw new Error('Escrow agreement not found.');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.iTHBToken,
      [
        'function approve(address spender, uint256 amount) returns (bool)',
      ],
      signer
    );

    const amountInWei = ethers.parseUnits(
      agreement.amount.toString(),
      18
    );

    const tx = await tokenContract.approve(
      CONTRACT_ADDRESSES.interlynkEscrow,
      amountInWei
    );

    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Token approval was not confirmed.');
    }

    const now = new Date().toISOString();

    setAgreements((prev) =>
      prev.map((item) => {
        if (item.id === agreementId) {
          return {
            ...item,
            tokenApproved: true,
            status: 'awaiting_deposit',
            approvalTxHash: tx.hash,
            updatedAt: now,
          };
        }

        return item;
      })
    );

    const newActivity: EscrowActivity = {
      id: `act-${Date.now()}`,
      escrowId: agreementId,
      escrowName: agreement.name,
      action: 'iTHB Approved',
      actorAddress: address || '',
      amount: agreement.amount,
      status: 'awaiting_deposit',
      timestamp: now,
      txHash: tx.hash,
      details: `Approved ${agreement.amount.toLocaleString()} iTHB for the Interlynk Escrow contract.`,
    };

    setActivities((prev) => [newActivity, ...prev]);

    return tx.hash;
  };

  const depositFunds = async (agreementId: string): Promise<string> => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not available.');
    }

    const agreement = agreements.find((a) => a.id === agreementId);

    if (!agreement) {
      throw new Error('Escrow agreement not found.');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const escrowContract = new ethers.Contract(
      CONTRACT_ADDRESSES.interlynkEscrow,
      ESCROW_ABI,
      signer
    );

    const tx = await escrowContract.depositTokens(
      BigInt(agreement.id)
    );

    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Deposit transaction was not confirmed.');
    }

    const now = new Date().toISOString();

    setAgreements((prev) =>
      prev.map((item) => {
        if (item.id === agreementId) {
          return {
            ...item,
            fundsDeposited: true,
            status: 'funds_locked',
            depositTxHash: tx.hash,
            updatedAt: now,
          };
        }

        return item;
      })
    );

    const newActivity: EscrowActivity = {
      id: `act-${Date.now()}`,
      escrowId: agreementId,
      escrowName: agreement.name,
      action: 'Funds Deposited',
      actorAddress: address || '',
      amount: agreement.amount,
      status: 'funds_locked',
      timestamp: now,
      txHash: tx.hash,
      details: `${agreement.amount.toLocaleString()} iTHB deposited into the Interlynk escrow contract.`,
    };

    setActivities((prev) => [newActivity, ...prev]);

    return tx.hash;
  };
  const submitWork = async (
    agreementId: string,
    note: string,
    link?: string
  ): Promise<void> => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not available.');
    }

    const agreement = agreements.find((a) => a.id === agreementId);

    if (!agreement) {
      throw new Error('Escrow agreement not found.');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const escrowContract = new ethers.Contract(
      CONTRACT_ADDRESSES.interlynkEscrow,
      ESCROW_ABI,
      signer
    );

    // Store the URL on-chain if provided.
    // Otherwise store the written completion note.
    const deliverableUri = link?.trim() || note.trim();

    const tx = await escrowContract.markWorkSubmitted(
      BigInt(agreement.id),
      deliverableUri
    );

    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Work submission transaction was not confirmed.');
    }

    const now = new Date().toISOString();

    setAgreements((prev) =>
      prev.map((item) => {
        if (item.id === agreementId) {
          return {
            ...item,
            status: 'awaiting_approval',
            submittedDeliverable: {
              note,
              link,
              submittedAt: now,
            },
            updatedAt: now,
          };
        }

        return item;
      })
    );

    const newActivity: EscrowActivity = {
      id: `act-${Date.now()}`,
      escrowId: agreementId,
      escrowName: agreement.name,
      action: 'Work Submitted for Review',
      actorAddress: address || '',
      amount: agreement.amount,
      status: 'awaiting_approval',
      timestamp: now,
      txHash: tx.hash,
      details: note,
    };

    setActivities((prev) => [newActivity, ...prev]);
  };
  const releaseFunds = async (agreementId: string): Promise<string> => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not available.');
    }

    const agreement = agreements.find((a) => a.id === agreementId);

    if (!agreement) {
      throw new Error('Escrow agreement not found.');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const escrowContract = new ethers.Contract(
      CONTRACT_ADDRESSES.interlynkEscrow,
      ESCROW_ABI,
      signer
    );

    const tx = await escrowContract.releaseFunds(
      BigInt(agreement.id)
    );

    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Release transaction was not confirmed.');
    }

    const now = new Date().toISOString();

    setAgreements((prev) =>
      prev.map((item) => {
        if (item.id === agreementId) {
          return {
            ...item,
            status: 'released',
            releaseTxHash: tx.hash,
            updatedAt: now,
          };
        }

        return item;
      })
    );

    const newActivity: EscrowActivity = {
      id: `act-${Date.now()}`,
      escrowId: agreementId,
      escrowName: agreement.name,
      action: 'Payment Released',
      actorAddress: address || '',
      amount: agreement.amount,
      status: 'released',
      timestamp: now,
      txHash: tx.hash,
      details: `Payer approved the completed work. ${agreement.amount.toLocaleString()} iTHB released to the recipient.`,
    };

    setActivities((prev) => [newActivity, ...prev]);

    return tx.hash;
  };

  const requestChanges = async (agreementId: string, feedback: string): Promise<void> => {
    const now = new Date().toISOString();

    setAgreements((prev) =>
      prev.map((item) => {
        if (item.id === agreementId) {
          return {
            ...item,
            status: 'funds_locked',
            feedbackNote: feedback,
            updatedAt: now,
          };
        }
        return item;
      })
    );

    const agreement = agreements.find((a) => a.id === agreementId);
    if (agreement) {
      const newActivity: EscrowActivity = {
        id: `act-${Date.now()}`,
        escrowId: agreementId,
        escrowName: agreement.name,
        action: 'Changes Requested',
        actorAddress: address || '',
        amount: agreement.amount,
        status: 'funds_locked',
        timestamp: now,
        details: `Payer requested revisions: "${feedback}"`,
      };
      setActivities((prev) => [newActivity, ...prev]);
    }
  };

  const cancelAgreement = async (agreementId: string): Promise<string> => {
    const txHash = '';
    const now = new Date().toISOString();

    const agreement = agreements.find((a) => a.id === agreementId);
    setAgreements((prev) =>
      prev.map((item) => {
        if (item.id === agreementId) {
          return {
            ...item,
            status: 'cancelled',
            updatedAt: now,
          };
        }
        return item;
      })
    );

    if (agreement) {
      const newActivity: EscrowActivity = {
        id: `act-${Date.now()}`,
        escrowId: agreementId,
        escrowName: agreement.name,
        action: 'Agreement Cancelled',
        actorAddress: address || '',
        amount: agreement.amount,
        status: 'cancelled',
        timestamp: now,
        details: 'Prototype cancellation completed. No real refund transaction was sent.',
      };
      setActivities((prev) => [newActivity, ...prev]);
    }

    return txHash;
  };

  return (
    <EscrowContext.Provider
      value={{
        agreements,
        activities,
        createAgreement,
        approveToken,
        depositFunds,
        submitWork,
        releaseFunds,
        requestChanges,
        cancelAgreement,
        getAgreement,
        resetDemoData,
      }}
    >
      {children}
    </EscrowContext.Provider>
  );
};

export function useEscrow(): EscrowContextType {
  const context = useContext(EscrowContext);
  if (!context) {
    throw new Error('useEscrow must be used within an EscrowProvider');
  }
  return context;
}
