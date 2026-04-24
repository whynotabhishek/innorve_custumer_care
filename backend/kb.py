"""
Horizon Community Credit Union — Knowledge Base
10 documents covering all major issue types
"""

from langchain_core.documents import Document

def add_kb_entry(title, content, category, faiss_db):
    """Add a new KB entry and re-index it into FAISS immediately.

    IMPORTANT: DOCUMENTS.append() alone does NOT update the FAISS index.
    You MUST call faiss_db.add_documents([doc]) which re-embeds and inserts
    into the live vector store.
    """
    doc = Document(page_content=content, metadata={"title": title, "category": category})
    DOCUMENTS.append(doc)           # Keep the list in sync
    faiss_db.add_documents([doc])   # CRITICAL: updates the live FAISS index
    return doc


DOCUMENTS = [
    Document(
        page_content="""FD premature withdrawal penalty is 1% deducted from the applicable
        interest rate for the period held. Principal is never reduced. No penalty within
        first 5 days of booking. Tax Saver FD (5-year) cannot be broken early except on
        death of account holder. Example: FD at 7.25% broken at 1 year gives 5.75% paid.""",
        metadata={"title": "FD Premature Withdrawal Policy", "category": "products"}
    ),
    Document(
        page_content="""Personal loan approval takes 1-3 business days. Vehicle loans same
        day to 2 days. Home loans 7-14 business days. Gold loans same day. Check loan status
        at members.horizoncu.in/loans/status using application reference number. SMS
        LOANSTATUS to 56789. Call 1800-123-4567 ext 4. If no decision after 5 business days
        for personal loan escalate to loan.grievance@horizoncu.in.""",
        metadata={"title": "Loan Application and Status Policy", "category": "loans"}
    ),
    Document(
        page_content="""Debit card gets blocked after 3 consecutive wrong PIN attempts. To
        unblock Option 1: visit members.horizoncu.in Cards section Unblock Card verify via
        Aadhaar OTP. Option 2: Call 1800-123-4567 option 2 verify with mobile OTP. Option 3:
        Visit branch with Aadhaar and PAN card. Option 4: HCCU mobile app Cards Manage
        Unblock. After 5 failed unblock attempts card must be replaced.""",
        metadata={"title": "Card Block and Unblock Policy", "category": "card"}
    ),
    Document(
        page_content="""Transaction disputes must be raised within 30 days as per RBI
        guidelines. File at Online Banking select transaction then Raise Dispute. Or call
        1800-123-4567 press 3. Or email disputes@horizoncu.in with UTR number and reason.
        RBI Zero Liability Policy: if reported within 3 working days full refund with zero
        liability. Provisional credit issued within 10 business days for disputes over
        Rs 10000. Investigation completed within 30 days.""",
        metadata={"title": "Transaction Dispute and Fraud Policy", "category": "dispute"}
    ),
    Document(
        page_content="""Address update requires Aadhaar card with new address or utility
        bill within 60 days or rental agreement. Update online at members.horizoncu.in
        Profile section Update Address using Aadhaar OTP for instant processing. Branch
        processing is immediate with original documents. Mobile number change requires
        branch visit with Aadhaar and PAN. Name change requires marriage certificate or
        court order and must be done at branch in person.""",
        metadata={"title": "Account Update and KYC Policy", "category": "account"}
    ),
    Document(
        page_content="""Minimum balance: Basic Savings account is zero balance under RBI
        BSBDA rules. Regular Savings account minimum average balance Rs 5000 urban and
        Rs 2000 rural. Non-maintenance charge Rs 200 per month plus GST. Premium Savings
        account MAB Rs 25000 with charge Rs 500 per month. Savings interest rates: Basic
        3.5%, Regular 4.0%, Premium 4.5% per annum on daily balance.""",
        metadata={"title": "Savings Account and Minimum Balance Policy", "category": "account"}
    ),
    Document(
        page_content="""FD interest rates effective April 2025: 7-29 days 4.5%, 30-90 days
        5.25%, 91-180 days 6.0%, 181 days to 1 year 6.75%, 1-2 years 7.25% most popular,
        2-3 years 7.10%, 3-5 years 6.90%, 5 year Tax Saver FD 6.75%. Senior citizens get
        additional 0.5% on all tenures. Minimum deposit Rs 5000. TDS deducted at 10% if
        annual interest exceeds Rs 40000.""",
        metadata={"title": "FD Interest Rates", "category": "products"}
    ),
    Document(
        page_content="""Personal loan interest starts from 10.5% per annum for CIBIL score
        750 and above. CIBIL 650-749 rates from 13% per annum. Loan amounts Rs 25000 to
        Rs 25 lakhs. Tenure 12 to 84 months. Processing fee 1% of loan amount minimum
        Rs 999 maximum Rs 5000 plus GST. No prepayment penalty after 12 EMIs. Required
        documents: Aadhaar PAN 3 months salary slips 6 months bank statements.""",
        metadata={"title": "Personal Loan Policy", "category": "loans"}
    ),
    Document(
        page_content="""Failed transaction refunds: UPI failures refunded within 24 hours
        automatically. NEFT failures within 2 hours during banking hours. ATM cash not
        dispensed but debited refunded within 5 business days automatically. If not received
        raise dispute at disputes@horizoncu.in with transaction reference number or call
        1800-123-4567 press 3.""",
        metadata={"title": "Failed Transaction Refund Policy", "category": "dispute"}
    ),
    Document(
        page_content="""Member grievance resolution: File complaint at members.horizoncu.in
        grievance section or email grievance@horizoncu.in or call 1800-123-4567 ext 9.
        Acknowledgement within 24 hours. Resolution within 30 days as per RBI mandate.
        Overcharge complaints: fee reversal reviewed within 5 business days. If HCCU error
        refunded within 3 business days plus Rs 100 compensation. Escalate unresolved
        complaints to RBI Banking Ombudsman at cms.rbi.org.in.""",
        metadata={"title": "Grievance and Complaint Policy", "category": "complaint"}
    ),
]
