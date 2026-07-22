export type Lang = "en" | "hi";

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
];

type Dict = Record<string, string>;

const en: Dict = {
  // common
  "common.back": "Back",
  "common.logout": "Logout",
  "common.loading": "Loading…",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.saveChanges": "Save Changes",
  "common.edit": "Edit",
  "common.close": "Close",
  "common.continue": "Continue",
  "common.review": "Review",
  "common.select": "Select",
  "common.app": "App",
  "common.admin": "Admin",

  // brand / titles
  "brand.tagline": "Field Outlet Tracker",
  "title.dashboard": "Deedar Field",
  "title.outletDetail": "Outlet Details",
  "title.addOutlet": "Add New Outlet",
  "title.addVisit": "Add Visit",
  "title.editVisit": "Update Visit",

  // fields
  "field.fullName": "Full Name",
  "field.namePlaceholder": "Your name",
  "field.mobile": "Mobile Number",
  "field.mobilePlaceholder": "10-digit mobile number",
  "field.password": "Password",
  "field.passwordMin": "At least 6 characters",
  "field.role": "Role",
  "field.division": "Division",
  "field.divisionSelect": "Select your division",
  "field.headQuarter": "Head Quarter",
  "field.headQuarterSelect": "Select your head quarter",
  "field.area": "Area",
  "field.areaPlaceholder": "e.g. route or locality name",
  "field.outletName": "Name of the Outlet",
  "field.poc": "Point of Contact",
  "field.address": "Address",
  "field.town": "Town/City",
  "field.type": "Type of Outlet",
  "field.specifyType": "Specify outlet type",
  "field.stock": "Stock at Outlet",
  "field.sold": "Packets Sold",
  "field.rank": "Deedar Rank at Outlet",
  "field.rankShelf": "Deedar Rank at Outlet (shelf position)",
  "field.competitor": "Competitor Presence",
  "field.remarks": "Remarks (optional)",
  "placeholder.packets": "Packets",
  "placeholder.rankEg": "e.g. 1 = first",
  "placeholder.competitorBrand": "Name the competitor brand",

  // roles / status
  "role.SO": "SO",
  "role.ISR": "ISR",
  "role.admin": "Admin",
  "status.pending": "Pending",
  "status.approved": "Approved",
  "status.rejected": "Rejected",

  // outlet types
  "type.Kirana": "Kirana",
  "type.Tea Stall": "Tea Stall",
  "type.Wholesale": "Wholesale",
  "type.Paan": "Paan",
  "type.Other": "Other",

  // competitor levels
  "competitor.None": "None",
  "competitor.Local Brands": "Local Brands",
  "competitor.National Brands": "National Brands",

  // login
  "login.title": "Rep Login",
  "login.subtitle": "Sign in with your mobile number",
  "login.button": "Log In",
  "login.signingIn": "Signing in…",
  "login.newRep": "New rep?",
  "login.createAccount": "Create an account",
  "login.error": "Something went wrong. Please try again.",

  // signup
  "signup.title": "Create Account",
  "signup.subtitle": "Sign up to request access",
  "signup.button": "Create Account",
  "signup.creating": "Creating…",
  "signup.haveAccount": "Already have an account?",
  "signup.login": "Log in",
  "signup.doneTitle": "Request received",
  "signup.doneSubtitle": "Your account is pending approval",
  "signup.doneBody":
    "Thanks, {name}. An admin will review your request and approve your access. You'll be able to log in once approved.",
  "signup.backToLogin": "Back to login",

  // change password
  "cp.titleForced": "Set a New Password",
  "cp.title": "Change Password",
  "cp.subtitleForced":
    "For your security, please replace the temporary password",
  "cp.subtitle": "Choose a new password",
  "cp.newPassword": "New Password",
  "cp.confirm": "Confirm New Password",
  "cp.confirmPlaceholder": "Re-enter new password",
  "cp.save": "Save Password",
  "cp.saving": "Saving…",
  "cp.mismatch": "Passwords do not match.",

  // dashboard
  "dash.welcome": "Welcome back",
  "dash.searchPlaceholder": "Search outlets by name, mobile, town...",
  "dash.searchResults": "Search Results ({count})",
  "dash.addOutlet": "Add New Outlet",
  "dash.addOutletSub": "Onboard a new outlet",
  "dash.addVisit": "Add Visit",
  "dash.addVisitSub": "Log a visit for an outlet",
  "dash.mySubmissions": "My Submissions (editable for 24h)",
  "dash.visitsInLast24": "{count} visit(s) in the last 24h",
  "dash.editableHours": "Editable for {hours} more hours",
  "dash.allOutlets": "All Outlets ({count})",
  "dash.noOutlets": "No outlets yet.",
  "dash.visitsCountLast": "{count} visit(s) · last {date}",
  "badge.edit": "Edit",

  // outlet detail
  "od.pocLabel": "Point of Contact",
  "od.mobileLabel": "Mobile",
  "od.addressLabel": "Address",
  "od.townDivisionLabel": "Town/Division",
  "od.gpsLabel": "GPS",
  "od.addVisit": "Add Visit for this Outlet",
  "od.centralOnly": "Visit history is available to the central data team only.",
  "od.visitHistory": "Visit History ({count})",
  "od.noVisits": "No visits recorded for this outlet yet.",
  "od.yourSubmissions": "Your Submissions (editable for 24h)",
  "od.repShort": "Rep {rep}",
  "od.stockSoldRank": "Stock {stock} · Sold {sold} · Rank #{rank}",
  "od.competitorLine": "Competitor: {value}",
  "od.remarksLine": "Remarks: {value}",

  // add outlet
  "ao.step.checkDup": "Check Duplicate",
  "ao.step.details": "Outlet Details",
  "ao.step.review": "Review",
  "ao.checkTitle": "Check for Existing Outlet",
  "ao.checkSub":
    "Enter the outlet's mobile number to rule out a duplicate before creating a new record.",
  "ao.dupFound": "Possible duplicate found",
  "ao.dupText":
    "{name} · {town} is already registered with this mobile number.",
  "ao.viewExisting": "View existing outlet",
  "ao.identityTitle": "Outlet Identity",
  "ao.reviewTitle": "Review & Submit",
  "ao.submitOutlet": "Submit Outlet",

  // gps
  "gps.title": "GPS Coordinates",
  "gps.capture": "Capture Current Location",
  "gps.locating": "Locating…",
  "gps.captured": "Captured: {lat}, {lng}",
  "gps.latitude": "Latitude",
  "gps.longitude": "Longitude",
  "gps.retry": "Retry location capture",
  "gps.errUnavailable":
    "Location services unavailable on this device. Enter coordinates manually.",
  "gps.errDenied":
    "Location access denied or unavailable. Enter coordinates manually.",

  // add visit find
  "avf.title": "Find the Outlet",
  "avf.sub": "Enter the outlet's mobile number — we'll pull up its details.",
  "avf.outletMobile": "Outlet Mobile Number",
  "avf.continue": "Continue to Visit Data",
  "avf.notFoundTitle": "No outlet found",
  "avf.notFoundText": "No outlet is registered with this mobile number yet.",
  "avf.addNew": "Add New Outlet",
  "avf.lastVisit": "Last visit: {date}",

  // add visit
  "av.step.visitData": "Visit Data",
  "av.step.review": "Review",
  "av.reviewTitle": "Review & Submit Visit",
  "av.submit": "Submit Visit",

  // review rows
  "review.outlet": "Outlet",
  "review.poc": "POC",
  "review.address": "Address",
  "review.location": "Location",
  "review.type": "Type",
  "review.gps": "GPS",
  "review.stock": "Stock",
  "review.sold": "Sold",
  "review.rank": "Rank",
  "review.competitor": "Competitor",
  "review.pkts": "pkts",

  // edit visit
  "ev.title": "Update Visit Data",
  "ev.subtitle": "{name} · editable for {hours} more hours",
  "ev.save": "Save Update",

  // admin
  "admin.title": "Admin · Users & Access",
  "admin.signedInAs": "Signed in as",
  "admin.addUser": "Add User",
  "admin.add": "+ Add",
  "admin.tempPassword": "Temporary Password (optional)",
  "admin.tempPasswordPlaceholder": "Defaults to mobile number if left blank",
  "admin.createUser": "Create User",
  "admin.creating": "Creating…",
  "admin.pending": "Pending ({count})",
  "admin.approved": "Approved ({count})",
  "admin.rejected": "Rejected ({count})",
  "admin.noPending": "No pending requests.",
  "admin.noApproved": "No approved users yet.",
  "admin.approve": "Approve",
  "admin.reject": "Reject",
  "admin.revoke": "Revoke",
  "admin.access": "Access",
  "admin.saving": "Saving…",
  "admin.createdMsg":
    "Created {name} ({phone}). Temporary password: {password} — they'll be asked to set a new one on first login.",
  "admin.loadError": "Failed to load users.",
  "admin.updateFailed": "Update failed.",
  "admin.genericError": "Something went wrong.",

  // toasts
  "toast.visitUpdated": "Visit updated",
  "toast.outletUpdated": "Outlet details updated",
  "toast.outletAdded": "Outlet added successfully",
  "toast.visitRecorded": "Visit recorded successfully",
  "toast.couldNotUpdateVisit": "Could not update visit",
  "toast.couldNotSave": "Could not save changes",
  "toast.couldNotAddOutlet": "Could not add outlet",
  "toast.couldNotRecordVisit": "Could not record visit",
};

const hi: Dict = {
  // common
  "common.back": "वापस",
  "common.logout": "लॉग आउट",
  "common.loading": "लोड हो रहा है…",
  "common.cancel": "रद्द करें",
  "common.save": "सहेजें",
  "common.saveChanges": "बदलाव सहेजें",
  "common.edit": "संपादित करें",
  "common.close": "बंद करें",
  "common.continue": "आगे बढ़ें",
  "common.review": "समीक्षा",
  "common.select": "चुनें",
  "common.app": "ऐप",
  "common.admin": "एडमिन",

  // brand / titles
  "brand.tagline": "फील्ड आउटलेट ट्रैकर",
  "title.dashboard": "Deedar Field",
  "title.outletDetail": "आउटलेट विवरण",
  "title.addOutlet": "नया आउटलेट जोड़ें",
  "title.addVisit": "विज़िट जोड़ें",
  "title.editVisit": "विज़िट अपडेट करें",

  // fields
  "field.fullName": "पूरा नाम",
  "field.namePlaceholder": "आपका नाम",
  "field.mobile": "मोबाइल नंबर",
  "field.mobilePlaceholder": "10 अंकों का मोबाइल नंबर",
  "field.password": "पासवर्ड",
  "field.passwordMin": "कम से कम 6 अक्षर",
  "field.role": "भूमिका",
  "field.division": "डिवीजन",
  "field.divisionSelect": "अपना डिवीजन चुनें",
  "field.headQuarter": "मुख्यालय",
  "field.headQuarterSelect": "अपना मुख्यालय चुनें",
  "field.area": "क्षेत्र",
  "field.areaPlaceholder": "जैसे रूट या इलाके का नाम",
  "field.outletName": "आउटलेट का नाम",
  "field.poc": "संपर्क व्यक्ति",
  "field.address": "पता",
  "field.town": "शहर",
  "field.type": "आउटलेट का प्रकार",
  "field.specifyType": "आउटलेट का प्रकार बताएं",
  "field.stock": "आउटलेट पर स्टॉक",
  "field.sold": "बेचे गए पैकेट",
  "field.rank": "आउटलेट पर दीदार रैंक",
  "field.rankShelf": "आउटलेट पर दीदार रैंक (शेल्फ स्थिति)",
  "field.competitor": "प्रतियोगी उपस्थिति",
  "field.remarks": "टिप्पणी (वैकल्पिक)",
  "placeholder.packets": "पैकेट",
  "placeholder.rankEg": "जैसे 1 = पहला",
  "placeholder.competitorBrand": "प्रतियोगी ब्रांड का नाम बताएं",

  // roles / status
  "role.SO": "एसओ",
  "role.ISR": "आईएसआर",
  "role.admin": "एडमिन",
  "status.pending": "लंबित",
  "status.approved": "स्वीकृत",
  "status.rejected": "अस्वीकृत",

  // outlet types
  "type.Kirana": "किराना",
  "type.Tea Stall": "चाय स्टॉल",
  "type.Wholesale": "थोक",
  "type.Paan": "पान",
  "type.Other": "अन्य",

  // competitor levels
  "competitor.None": "कोई नहीं",
  "competitor.Local Brands": "स्थानीय ब्रांड",
  "competitor.National Brands": "राष्ट्रीय ब्रांड",

  // login
  "login.title": "रेप लॉगिन",
  "login.subtitle": "अपने मोबाइल नंबर से साइन इन करें",
  "login.button": "लॉग इन",
  "login.signingIn": "साइन इन हो रहा है…",
  "login.newRep": "नए रेप?",
  "login.createAccount": "खाता बनाएं",
  "login.error": "कुछ गड़बड़ हो गई। कृपया पुनः प्रयास करें।",

  // signup
  "signup.title": "खाता बनाएं",
  "signup.subtitle": "एक्सेस के लिए साइन अप करें",
  "signup.button": "खाता बनाएं",
  "signup.creating": "बन रहा है…",
  "signup.haveAccount": "पहले से खाता है?",
  "signup.login": "लॉग इन करें",
  "signup.doneTitle": "अनुरोध प्राप्त हुआ",
  "signup.doneSubtitle": "आपका खाता अनुमोदन के लिए लंबित है",
  "signup.doneBody":
    "धन्यवाद, {name}। एक एडमिन आपके अनुरोध की समीक्षा करेगा और आपकी एक्सेस स्वीकृत करेगा। स्वीकृति के बाद आप लॉग इन कर सकेंगे।",
  "signup.backToLogin": "लॉगिन पर वापस जाएं",

  // change password
  "cp.titleForced": "नया पासवर्ड सेट करें",
  "cp.title": "पासवर्ड बदलें",
  "cp.subtitleForced": "अपनी सुरक्षा के लिए, कृपया अस्थायी पासवर्ड बदलें",
  "cp.subtitle": "एक नया पासवर्ड चुनें",
  "cp.newPassword": "नया पासवर्ड",
  "cp.confirm": "नया पासवर्ड पुष्टि करें",
  "cp.confirmPlaceholder": "नया पासवर्ड फिर से दर्ज करें",
  "cp.save": "पासवर्ड सहेजें",
  "cp.saving": "सहेजा जा रहा है…",
  "cp.mismatch": "पासवर्ड मेल नहीं खाते।",

  // dashboard
  "dash.welcome": "वापसी पर स्वागत है",
  "dash.searchPlaceholder": "नाम, मोबाइल, शहर से आउटलेट खोजें...",
  "dash.searchResults": "खोज परिणाम ({count})",
  "dash.addOutlet": "नया आउटलेट जोड़ें",
  "dash.addOutletSub": "नया आउटलेट जोड़ें",
  "dash.addVisit": "विज़िट जोड़ें",
  "dash.addVisitSub": "आउटलेट के लिए विज़िट दर्ज करें",
  "dash.mySubmissions": "मेरी प्रविष्टियाँ (24 घंटे तक संपादन योग्य)",
  "dash.visitsInLast24": "पिछले 24 घंटे में {count} विज़िट",
  "dash.editableHours": "{hours} और घंटे संपादन योग्य",
  "dash.allOutlets": "सभी आउटलेट ({count})",
  "dash.noOutlets": "अभी तक कोई आउटलेट नहीं।",
  "dash.visitsCountLast": "{count} विज़िट · अंतिम {date}",
  "badge.edit": "संपादित करें",

  // outlet detail
  "od.pocLabel": "संपर्क व्यक्ति",
  "od.mobileLabel": "मोबाइल",
  "od.addressLabel": "पता",
  "od.townDivisionLabel": "शहर/डिवीजन",
  "od.gpsLabel": "जीपीएस",
  "od.addVisit": "इस आउटलेट के लिए विज़िट जोड़ें",
  "od.centralOnly": "विज़िट इतिहास केवल केंद्रीय डेटा टीम को उपलब्ध है।",
  "od.visitHistory": "विज़िट इतिहास ({count})",
  "od.noVisits": "इस आउटलेट के लिए अभी तक कोई विज़िट दर्ज नहीं।",
  "od.yourSubmissions": "आपकी प्रविष्टियाँ (24 घंटे तक संपादन योग्य)",
  "od.repShort": "रेप {rep}",
  "od.stockSoldRank": "स्टॉक {stock} · बिक्री {sold} · रैंक #{rank}",
  "od.competitorLine": "प्रतियोगी: {value}",
  "od.remarksLine": "टिप्पणी: {value}",

  // add outlet
  "ao.step.checkDup": "डुप्लिकेट जांचें",
  "ao.step.details": "आउटलेट विवरण",
  "ao.step.review": "समीक्षा",
  "ao.checkTitle": "मौजूदा आउटलेट जांचें",
  "ao.checkSub":
    "नया रिकॉर्ड बनाने से पहले डुप्लिकेट से बचने के लिए आउटलेट का मोबाइल नंबर दर्ज करें।",
  "ao.dupFound": "संभावित डुप्लिकेट मिला",
  "ao.dupText": "{name} · {town} इस मोबाइल नंबर से पहले से पंजीकृत है।",
  "ao.viewExisting": "मौजूदा आउटलेट देखें",
  "ao.identityTitle": "आउटलेट पहचान",
  "ao.reviewTitle": "समीक्षा करें और सबमिट करें",
  "ao.submitOutlet": "आउटलेट सबमिट करें",

  // gps
  "gps.title": "जीपीएस निर्देशांक",
  "gps.capture": "वर्तमान स्थान कैप्चर करें",
  "gps.locating": "स्थान खोजा जा रहा है…",
  "gps.captured": "कैप्चर किया: {lat}, {lng}",
  "gps.latitude": "अक्षांश",
  "gps.longitude": "देशांतर",
  "gps.retry": "स्थान कैप्चर पुनः प्रयास करें",
  "gps.errUnavailable":
    "इस डिवाइस पर स्थान सेवाएं उपलब्ध नहीं हैं। निर्देशांक मैन्युअल रूप से दर्ज करें।",
  "gps.errDenied":
    "स्थान एक्सेस अस्वीकृत या अनुपलब्ध। निर्देशांक मैन्युअल रूप से दर्ज करें।",

  // add visit find
  "avf.title": "आउटलेट खोजें",
  "avf.sub": "आउटलेट का मोबाइल नंबर दर्ज करें — हम इसका विवरण दिखाएंगे।",
  "avf.outletMobile": "आउटलेट मोबाइल नंबर",
  "avf.continue": "विज़िट डेटा पर आगे बढ़ें",
  "avf.notFoundTitle": "कोई आउटलेट नहीं मिला",
  "avf.notFoundText": "इस मोबाइल नंबर से अभी तक कोई आउटलेट पंजीकृत नहीं है।",
  "avf.addNew": "नया आउटलेट जोड़ें",
  "avf.lastVisit": "अंतिम विज़िट: {date}",

  // add visit
  "av.step.visitData": "विज़िट डेटा",
  "av.step.review": "समीक्षा",
  "av.reviewTitle": "समीक्षा करें और विज़िट सबमिट करें",
  "av.submit": "विज़िट सबमिट करें",

  // review rows
  "review.outlet": "आउटलेट",
  "review.poc": "संपर्क",
  "review.address": "पता",
  "review.location": "स्थान",
  "review.type": "प्रकार",
  "review.gps": "जीपीएस",
  "review.stock": "स्टॉक",
  "review.sold": "बिक्री",
  "review.rank": "रैंक",
  "review.competitor": "प्रतियोगी",
  "review.pkts": "पैकेट",

  // edit visit
  "ev.title": "विज़िट डेटा अपडेट करें",
  "ev.subtitle": "{name} · {hours} और घंटे संपादन योग्य",
  "ev.save": "अपडेट सहेजें",

  // admin
  "admin.title": "एडमिन · उपयोगकर्ता और एक्सेस",
  "admin.signedInAs": "साइन इन:",
  "admin.addUser": "उपयोगकर्ता जोड़ें",
  "admin.add": "+ जोड़ें",
  "admin.tempPassword": "अस्थायी पासवर्ड (वैकल्पिक)",
  "admin.tempPasswordPlaceholder": "खाली छोड़ने पर मोबाइल नंबर डिफ़ॉल्ट होगा",
  "admin.createUser": "उपयोगकर्ता बनाएं",
  "admin.creating": "बन रहा है…",
  "admin.pending": "लंबित ({count})",
  "admin.approved": "स्वीकृत ({count})",
  "admin.rejected": "अस्वीकृत ({count})",
  "admin.noPending": "कोई लंबित अनुरोध नहीं।",
  "admin.noApproved": "अभी तक कोई स्वीकृत उपयोगकर्ता नहीं।",
  "admin.approve": "स्वीकृत करें",
  "admin.reject": "अस्वीकार करें",
  "admin.revoke": "रद्द करें",
  "admin.access": "एक्सेस",
  "admin.saving": "सहेजा जा रहा है…",
  "admin.createdMsg":
    "{name} ({phone}) बनाया गया। अस्थायी पासवर्ड: {password} — पहली बार लॉगिन पर उन्हें नया पासवर्ड सेट करने को कहा जाएगा।",
  "admin.loadError": "उपयोगकर्ता लोड करने में विफल।",
  "admin.updateFailed": "अपडेट विफल।",
  "admin.genericError": "कुछ गड़बड़ हो गई।",

  // toasts
  "toast.visitUpdated": "विज़िट अपडेट हुई",
  "toast.outletUpdated": "आउटलेट विवरण अपडेट हुए",
  "toast.outletAdded": "आउटलेट सफलतापूर्वक जोड़ा गया",
  "toast.visitRecorded": "विज़िट सफलतापूर्वक दर्ज हुई",
  "toast.couldNotUpdateVisit": "विज़िट अपडेट नहीं हो सकी",
  "toast.couldNotSave": "बदलाव सहेजे नहीं जा सके",
  "toast.couldNotAddOutlet": "आउटलेट नहीं जोड़ा जा सका",
  "toast.couldNotRecordVisit": "विज़िट दर्ज नहीं हो सकी",
};

export const messages: Record<Lang, Dict> = { en, hi };

export function translate(
  lang: Lang,
  key: string,
  params?: Record<string, string | number>,
): string {
  const s = messages[lang]?.[key] ?? messages.en[key] ?? key;
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] !== undefined ? String(params[k]) : `{${k}}`,
  );
}
