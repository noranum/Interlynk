export type EscrowStatus =
  | 'draft'
  | 'awaiting_token_approval'
  | 'awaiting_deposit'
  | 'funds_locked'
  | 'work_submitted'
  | 'awaiting_approval'
  | 'released'
  | 'cancelled'
  | 'refunded';

export interface DeliverableSubmission {
  note: string;
  link?: string;
  submittedAt: string;
}

export interface EscrowAgreement {
  id: string;
  name: string;
  description: string;
  releaseCondition: string;
  payerAddress: string;
  recipientAddress: string;
  amount: number; // in iTHB
  deadline: string; // ISO date string or formatted date
  createdAt: string;
  status: EscrowStatus;
  tokenApproved: boolean;
  fundsDeposited: boolean;
  submittedDeliverable?: DeliverableSubmission;
  feedbackNote?: string;
  approvalTxHash?: string;
  depositTxHash?: string;
  releaseTxHash?: string;
  cancelledTxHash?: string;
  updatedAt: string;
}

export interface EscrowActivity {
  id: string;
  escrowId: string;
  escrowName: string;
  action: string;
  actorAddress: string;
  amount: number;
  status: EscrowStatus;
  timestamp: string;
  txHash?: string;
  details?: string;
}

export interface CreateEscrowFormInput {
  name: string;
  recipientAddress: string;
  amount: string;
  description: string;
  releaseCondition: string;
  deadline: string;
}
