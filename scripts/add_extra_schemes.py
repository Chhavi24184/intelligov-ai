#!/usr/bin/env python3
"""Keep a fast 500-scheme catalogue, prioritizing the curated extra schemes supplied for IntelliGov AI.

Run from the repository root:
    python scripts/add_extra_schemes.py
"""
import json
from pathlib import Path

EXTRA_SCHEMES = [
    {"name":"PM Kisan Samman Nidhi","category":"Farmer","description":"Income support scheme for eligible farmer families providing ₹6,000 per year in three equal installments.","benefits":"₹6,000 per year (₹2,000 per installment, 3 installments) directly to bank account.","eligibility":"Eligible landholding farmer families, subject to scheme conditions.","documents":["Aadhaar Card","Bank Passbook","Land Records"],"deadline":"Ongoing — apply anytime","official_url":"https://pmkisan.gov.in"},
    {"name":"Ayushman Bharat PM-JAY","category":"Healthcare","description":"Health assurance scheme providing ₹5 lakh per family per year for hospitalisation.","benefits":"₹5 lakh health cover per family per year for secondary and tertiary care hospitalisation.","eligibility":"Families identified under applicable government eligibility criteria (SECC database).","documents":["Aadhaar Card","Ration Card","Family ID or Eligibility Proof"],"deadline":"Ongoing — check eligibility anytime","official_url":"https://pmjay.gov.in"},
    {"name":"Pradhan Mantri Awas Yojana","category":"Housing","description":"Housing assistance scheme providing financial support to construct or buy a pucca house.","benefits":"Subsidy up to ₹2.67 lakh for EWS/LIG; construction assistance for rural households.","eligibility":"Eligible EWS, LIG, or other beneficiary categories under the applicable PMAY component.","documents":["Aadhaar Card","Income Certificate","Address Proof"],"deadline":"Ongoing — apply at nearest CSC or bank","official_url":"https://pmaymis.gov.in"},
    {"name":"Pradhan Mantri Mudra Yojana","category":"Business","description":"Credit support scheme for micro enterprises and small businesses.","benefits":"Collateral-free loans: Shishu (up to ₹50,000), Kishore (₹50,001–₹5 lakh), Tarun (₹5–₹10 lakh).","eligibility":"Eligible non-corporate small business owners and entrepreneurs.","documents":["PAN Card","Aadhaar Card","Business Proof"],"deadline":"Ongoing — apply at any bank or NBFC","official_url":"https://mudra.org.in"},
    {"name":"PM Vishwakarma","category":"Artisan","description":"Support programme for traditional artisans and craftspeople covering skill training, toolkit, and credit.","benefits":"₹15,000 toolkit incentive; skill training stipend ₹500/day; collateral-free credit up to ₹3 lakh.","eligibility":"Eligible artisans engaged in notified traditional trades.","documents":["Aadhaar Card","Occupation Proof","Bank Account Details"],"deadline":"Ongoing — registration at Common Service Centres","official_url":"https://pmvishwakarma.gov.in"},
    {"name":"Sukanya Samriddhi Yojana","category":"Girl Child","description":"Small-savings scheme for a girl child with tax benefits.","benefits":"Interest rate varies by notified rate; tax treatment and maturity are subject to current scheme rules.","eligibility":"Account may be opened for an eligible girl child below 10 years of age.","documents":["Birth Certificate","Aadhaar Card","Parent or Guardian ID Proof"],"deadline":"Ongoing — open account at post office or bank","official_url":"https://www.india.gov.in/sukanya-samriddhi-yojna"},
    {"name":"Atal Pension Yojana","category":"Pension","description":"Pension scheme for eligible citizens, especially workers in the unorganised sector.","benefits":"Guaranteed monthly pension of ₹1,000–₹5,000 after age 60 based on contribution.","eligibility":"Indian citizens aged 18–40 with a savings bank account, subject to current enrolment rules.","documents":["Aadhaar Card","Bank Account Details","Mobile Number"],"deadline":"Ongoing — enrol via bank or net banking","official_url":"https://npscra.nsdl.co.in/nps-lite-atal-pension-yojana-apy.php"},
    {"name":"Pradhan Mantri Kaushal Vikas Yojana","category":"Skill Development","description":"Industry-relevant skill training, certification, upskilling, and reskilling programme.","benefits":"Approved training and certification benefits vary by programme component and current guidelines.","eligibility":"Eligible Indian youth seeking approved skill training.","documents":["Aadhaar Card","Educational Certificate","Bank Account Details"],"deadline":"Ongoing — check skill centres near you","official_url":"https://www.pmkvyofficial.org"},
    {"name":"Central Sector Scholarship Scheme","category":"Education","description":"Scholarship support for eligible students pursuing higher education.","benefits":"Scholarship amounts depend on study level and current official guidelines.","eligibility":"Eligible students meeting the current merit and family-income criteria.","documents":["Aadhaar Card","Income Certificate","Marksheet"],"deadline":"Annual — check current dates on the National Scholarship Portal","official_url":"https://scholarships.gov.in"},
    {"name":"Prime Minister's Employment Generation Programme","category":"Employment","description":"Credit-linked subsidy support for setting up eligible micro-enterprises.","benefits":"Subsidy and project limits depend on location, category, activity, and current guidelines.","eligibility":"Individuals aged 18+ meeting the current education and project criteria.","documents":["Aadhaar Card","Project Report","Educational Certificate"],"deadline":"Ongoing — apply through KVIC/KVIB or banks","official_url":"https://www.kviconline.gov.in/pmegpeportal"},
    {"name":"Mahatma Gandhi National Rural Employment Guarantee Scheme","category":"Rural Employment","description":"Provides demand-driven wage employment to rural households.","benefits":"Up to 100 days of guaranteed wage employment per rural household per year, subject to the Act and applicable rules.","eligibility":"Adult members of rural households willing to do unskilled manual work.","documents":["Job Card","Aadhaar Card","Bank Account Details"],"deadline":"Ongoing — register at Gram Panchayat","official_url":"https://nrega.nic.in"},
    {"name":"Pradhan Mantri Ujjwala Yojana","category":"Women Welfare","description":"Provides LPG connection support to eligible households.","benefits":"LPG connection assistance and other benefits as per current scheme guidelines.","eligibility":"Eligible adult women from qualifying households under current rules.","documents":["Aadhaar Card","Ration Card","Bank Account Details"],"deadline":"Check current registration availability with LPG distributor or official portal","official_url":"https://pmuy.gov.in"},
    {"name":"PM Surya Ghar Muft Bijli Yojana","category":"Energy","description":"Supports installation of rooftop solar systems for eligible households.","benefits":"Subsidy depends on system capacity and applicable guidelines; eligible households may receive up to 300 units of free electricity per month under the scheme design.","eligibility":"Eligible residential electricity consumers with suitable rooftop space.","documents":["Aadhaar Card","Electricity Bill","Bank Account Details"],"deadline":"Ongoing — apply on official portal","official_url":"https://pmsuryaghar.gov.in"},
    {"name":"Pradhan Mantri Fasal Bima Yojana","category":"Farmer","description":"Crop insurance scheme that helps protect farmers against specified crop losses.","benefits":"Insurance cover for eligible notified crop losses; premium rates and coverage depend on crop and season.","eligibility":"Eligible farmers growing notified crops in notified areas.","documents":["Aadhaar Card","Land Records","Bank Account Details"],"deadline":"Seasonal — check the applicable Rabi/Kharif deadline","official_url":"https://pmfby.gov.in"},
    {"name":"Kisan Credit Card Scheme","category":"Farmer","description":"Provides timely short-term credit support for agricultural and allied activities.","benefits":"Credit limit, interest support, and insurance depend on eligibility and current guidelines.","eligibility":"Eligible farmers, tenant farmers, sharecroppers, and allied-sector applicants as per bank rules.","documents":["Aadhaar Card","Land Records or Cultivation Proof","Bank Account Details"],"deadline":"Ongoing — apply at nearest bank branch","official_url":"https://www.nabard.org/content.aspx?id=580"},
    {"name":"Soil Health Card Scheme","category":"Agriculture","description":"Provides soil nutrient information and fertilizer-use recommendations to farmers.","benefits":"Soil testing and fertilizer-use recommendations through the scheme's services.","eligibility":"Farmers with agricultural land or cultivation activity.","documents":["Aadhaar Card","Land Records","Mobile Number"],"deadline":"Contact nearest Krishi Vigyan Kendra or agriculture office","official_url":"https://soilhealth.dac.gov.in"},
    {"name":"PM KUSUM","category":"Agriculture Energy","description":"Supports solar pumps and solarisation solutions for eligible agricultural users.","benefits":"Subsidy rates depend on component, state, and current implementation rules.","eligibility":"Eligible farmers and agricultural consumers, subject to state implementation rules.","documents":["Aadhaar Card","Land Records","Electricity Connection Details"],"deadline":"Check current state DISCOM or agriculture department notices","official_url":"https://mnre.gov.in/solar/schemes"},
    {"name":"Pradhan Mantri Matru Vandana Yojana","category":"Maternity","description":"Maternity benefit programme for eligible pregnant women and lactating mothers.","benefits":"Benefits vary by eligible birth order and current scheme rules.","eligibility":"Pregnant women and lactating mothers meeting scheme eligibility conditions.","documents":["Aadhaar Card","Bank Account Details","Pregnancy Registration Record"],"deadline":"Register through the official portal, Anganwadi Centre, or health facility","official_url":"https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana"},
    {"name":"Pradhan Mantri Jeevan Jyoti Bima Yojana","category":"Insurance","description":"Renewable life-insurance cover for eligible bank or post-office account holders.","benefits":"Life insurance cover and premium as notified under current scheme rules.","eligibility":"Eligible bank/post-office account holders aged 18–50 years, subject to scheme conditions.","documents":["Aadhaar Card","Bank Account Details","Consent Form"],"deadline":"Ongoing — enrol through participating bank or post office","official_url":"https://jansuraksha.gov.in/Forms-PMJJBY.aspx"},
    {"name":"Pradhan Mantri Suraksha Bima Yojana","category":"Insurance","description":"Renewable accidental-death and disability insurance cover.","benefits":"Accidental death/disability cover and premium as notified under current scheme rules.","eligibility":"Eligible bank/post-office account holders aged 18–70 years, subject to scheme conditions.","documents":["Aadhaar Card","Bank Account Details","Consent Form"],"deadline":"Ongoing — enrol through participating bank or post office","official_url":"https://jansuraksha.gov.in/Forms-PMSBY.aspx"},
    {"name":"PM SVANidhi","category":"Street Vendors","description":"Provides working-capital support for eligible street vendors.","benefits":"Loan amount and subsequent loan tranches are subject to current scheme guidelines and repayment history.","eligibility":"Eligible street vendors identified under applicable scheme rules.","documents":["Aadhaar Card","Vendor Certificate or ID Card","Bank Account Details"],"deadline":"Check current application availability on the official portal","official_url":"https://pmsvanidhi.mohua.gov.in"},
    {"name":"Stand-Up India","category":"Entrepreneurship","description":"Facilitates bank loans for eligible women and SC/ST entrepreneurs.","benefits":"Loan terms and availability depend on current scheme rules and participating lenders.","eligibility":"Eligible women or SC/ST entrepreneurs establishing a qualifying greenfield enterprise, subject to current rules.","documents":["PAN Card","Aadhaar Card","Business Plan"],"deadline":"Check current availability with participating banks and official portal","official_url":"https://www.standupmitra.in"},
    {"name":"National Apprenticeship Promotion Scheme","category":"Apprenticeship","description":"Promotes apprenticeship training and workplace learning opportunities.","benefits":"Stipend support and reimbursement depend on apprenticeship category and current rules.","eligibility":"Eligible candidates and establishments under applicable apprenticeship rules.","documents":["Aadhaar Card","Educational Certificate","Bank Account Details"],"deadline":"Ongoing — register at apprenticeshipindia.gov.in","official_url":"https://www.apprenticeshipindia.gov.in"},
    {"name":"Jan Shikshan Sansthan Scheme","category":"Skill Development","description":"Provides non-formal vocational training, especially for disadvantaged groups.","benefits":"Vocational training and certification depend on the local centre and approved programme.","eligibility":"Eligible youth and adults; priority groups are defined by programme guidelines.","documents":["Aadhaar Card","Address Proof","Educational Certificate if Available"],"deadline":"Contact nearest JSS centre","official_url":"https://jss.gov.in"},
    {"name":"Deen Dayal Upadhyaya Grameen Kaushalya Yojana","category":"Rural Skill Development","description":"Skill training and placement support for eligible rural youth from poor households.","benefits":"Approved training, placement, and post-placement support as available under programme rules.","eligibility":"Eligible rural youth from poor households, subject to current age/category rules.","documents":["Aadhaar Card","Ration Card or Rural Household Proof","Educational Certificate"],"deadline":"Contact an approved DDU-GKY Project Implementing Agency","official_url":"https://ddugky.gov.in"},
    {"name":"Deendayal Antyodaya Yojana National Rural Livelihoods Mission","category":"Rural Livelihood","description":"Supports rural livelihoods through self-help groups, financial inclusion, and enterprise development.","benefits":"Support may include SHG funds, bank linkage, livelihood training, and enterprise support as per guidelines.","eligibility":"Eligible rural households, particularly members of self-help groups.","documents":["Aadhaar Card","Bank Account Details","Self-Help Group Details"],"deadline":"Contact Block Mission Management Unit","official_url":"https://aajeevika.gov.in"},
    {"name":"National Social Assistance Programme","category":"Social Security","description":"Provides social assistance through pension and family-benefit components.","benefits":"Benefit amounts vary by component and state top-ups; check current official rules.","eligibility":"Eligible elderly people, widows, persons with disabilities, and bereaved families under applicable criteria.","documents":["Aadhaar Card","Income or BPL Certificate","Bank Account Details"],"deadline":"Apply through Gram Panchayat or Urban Local Body","official_url":"https://nsap.nic.in"},
    {"name":"Pradhan Mantri Jan Dhan Yojana","category":"Financial Inclusion","description":"Promotes access to basic banking services and financial inclusion.","benefits":"Basic bank account and eligible banking features under current scheme terms.","eligibility":"Eligible Indian citizens seeking access to a basic bank account.","documents":["Aadhaar Card","PAN Card if Available","Address Proof"],"deadline":"Ongoing — contact a bank branch or banking correspondent","official_url":"https://pmjdy.gov.in"},
    {"name":"PM YASASVI Scholarship Scheme","category":"Education","description":"Scholarship support for eligible students from specified disadvantaged categories.","benefits":"Benefits, classes covered, and selection process depend on current official notifications.","eligibility":"Students in notified categories who meet current class and income criteria.","documents":["Aadhaar Card","Caste Certificate","Income Certificate","Marksheet"],"deadline":"Check current notification and dates on the official scholarship portal","official_url":"https://scholarships.gov.in"},
    {"name":"National Career Service","category":"Employment","description":"Digital career platform offering job search, career counselling, job fairs, and skill information.","benefits":"Free job matching, career information, counselling, and job-fair access.","eligibility":"Job seekers, students, employers, and career-service users.","documents":["Aadhaar Card","Educational Certificate","Resume or Employment Details"],"deadline":"Ongoing — register at NCS portal","official_url":"https://www.ncs.gov.in"},
]

TARGETS = [
    Path("backend/data/schemes.json"),
    Path("Government_Schemes.json"),
]

def main():
    total_added = 0
    for path in TARGETS:
        if not path.exists():
            print(f"SKIP: {path} not found")
            continue
        with path.open("r", encoding="utf-8-sig") as f:
            data = json.load(f)
        if not isinstance(data, list):
            raise ValueError(f"{path} must contain a JSON array; no changes written.")
        existing_names = {
            str(item.get("name", "")).strip().casefold()
            for item in data if isinstance(item, dict)
        }
        numeric_ids = []
        for item in data:
            if isinstance(item, dict):
                try:
                    numeric_ids.append(int(item.get("id")))
                except (TypeError, ValueError):
                    pass
        next_id = max(numeric_ids, default=0) + 1
        added = 0
        for scheme in EXTRA_SCHEMES:
            key = scheme["name"].strip().casefold()
            if key in existing_names:
                continue
            new_item = dict(scheme)
            new_item["id"] = next_id
            next_id += 1
            data.append(new_item)
            existing_names.add(key)
            added += 1
        # Keep all curated EXTRA_SCHEMES first, then fill the remaining slots
        # with existing catalogue entries, capped at 500 for faster startup.
        preferred_names = {s["name"].strip().casefold() for s in EXTRA_SCHEMES}
        preferred = [item for item in data if str(item.get("name", "")).strip().casefold() in preferred_names]
        remaining = [item for item in data if str(item.get("name", "")).strip().casefold() not in preferred_names]
        data = (preferred + remaining)[:500]
        if added or len(data) != len(existing_names):
            with path.open("w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.write("\\n")
        print(f"{path}: added {added}; total kept {len(data)}")
        total_added = max(total_added, added)
    print("Done. Existing scheme records were preserved; duplicate names were skipped.")
    print("Note: verify current benefits/deadlines against official portals before presenting them as definitive.")

if __name__ == "__main__":
    main()
