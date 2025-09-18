# Transaction Creation Update Plan

## Overview
Update transaction creation to connect transactions directly to subcontractor services entity instead of subcontractors, so transaction -> service -> subcontractor.

## Tasks
- [ ] Create TransactionServiceEntity.java (new join entity)
- [ ] Update TransactionService.java createBookingTransaction method
- [ ] Update BookingTransactionDTO.java to include serviceIds
- [ ] Update frontend selectservice-page.jsx to send service IDs
- [ ] Test transaction creation with multiple services
- [ ] Update admin pages if needed for consistency

## Current Status
- Analysis completed
- Plan approved by user
- Ready to implement changes
