// Indian States → Cities → Areas cascading data
const locationData = {
    "Andhra Pradesh": {
        "Visakhapatnam": ["Gajuwaka", "MVP Colony", "Dwaraka Nagar", "Madhurawada", "Seethammadhara", "Rushikonda"],
        "Vijayawada": ["Benz Circle", "Governorpet", "Labbipet", "Moghalrajpuram", "Patamata", "Bhavanipuram"],
        "Guntur": ["Brodipet", "Arundelpet", "Lakshmipuram", "Nagarampalem", "Pattabhipuram"],
        "Tirupati": ["Tirumala", "Alipiri", "Balaji Colony", "Renigunta", "Chandragiri"],
        "Kurnool": ["Budhawarpet", "Kallur", "Nandyal Road", "Venkataramana Colony"]
    },
    "Arunachal Pradesh": {
        "Itanagar": ["Naharlagun", "Ganga", "Nirjuli", "Chimpu", "Banderdewa"],
        "Tawang": ["Old Market", "New Market", "Bomdir", "Jang"]
    },
    "Assam": {
        "Guwahati": ["Paltan Bazaar", "Fancy Bazaar", "Dispur", "Chandmari", "Zoo Road", "Ganeshguri"],
        "Silchar": ["Ambicapatty", "Tarapur", "Rangirkhari", "Premtala"],
        "Dibrugarh": ["Graham Bazaar", "Chowkidinghee", "Mohanbari", "AT Road"]
    },
    "Bihar": {
        "Patna": ["Boring Road", "Kankarbagh", "Rajendra Nagar", "Danapur", "Bailey Road", "Ashok Rajpath"],
        "Gaya": ["Station Road", "Swarajpuri", "GB Road", "Tekari Road"],
        "Muzaffarpur": ["Saraiyaganj", "Mithanpura", "Juran Chapra", "Ramna"]
    },
    "Chhattisgarh": {
        "Raipur": ["Shankar Nagar", "Telibandha", "Civil Lines", "Tatibandh", "Devendra Nagar"],
        "Bhilai": ["Civic Centre", "Supela", "Nehru Nagar", "Junwani"],
        "Bilaspur": ["Vyapar Vihar", "Sarkanda", "Torwa", "Seepat Road"]
    },
    "Delhi": {
        "New Delhi": ["Connaught Place", "Karol Bagh", "Saket", "Dwarka", "Janakpuri", "Rohini"],
        "South Delhi": ["Hauz Khas", "Greater Kailash", "Malviya Nagar", "Lajpat Nagar", "Defence Colony"],
        "East Delhi": ["Preet Vihar", "Laxmi Nagar", "Mayur Vihar", "Patparganj", "Karkardooma"],
        "North Delhi": ["Kamla Nagar", "Model Town", "Pitampura", "Civil Lines", "Chandni Chowk"],
        "West Delhi": ["Rajouri Garden", "Tilak Nagar", "Paschim Vihar", "Punjabi Bagh", "Vikaspuri"]
    },
    "Goa": {
        "Panaji": ["Miramar", "Dona Paula", "Campal", "Altinho", "Fontainhas"],
        "Margao": ["Comba", "Aquem", "Fatorda", "Navelim", "Borda"],
        "Vasco da Gama": ["Mangor Hill", "Baina", "Chicalim", "Dabolim"]
    },
    "Gujarat": {
        "Ahmedabad": ["Navrangpura", "Maninagar", "Satellite", "Vastrapur", "Bopal", "SG Highway"],
        "Surat": ["Adajan", "Vesu", "Athwa", "Ring Road", "Piplod", "Katargam"],
        "Vadodara": ["Alkapuri", "Race Course", "Sayajigunj", "Manjalpur", "Fatehgunj"],
        "Rajkot": ["Kalawad Road", "University Road", "Yagnik Road", "150 Feet Ring Road"]
    },
    "Haryana": {
        "Gurugram": ["DLF Phase 1", "Sector 29", "MG Road", "Sohna Road", "Golf Course Road", "Cyber City"],
        "Faridabad": ["Sector 15", "Sector 21", "NIT", "Ballabhgarh", "Greater Faridabad"],
        "Panipat": ["Model Town", "Sector 13", "GT Road", "Siwah"],
        "Ambala": ["Ambala Cantt", "Ambala City", "Baldev Nagar", "Prem Nagar"]
    },
    "Himachal Pradesh": {
        "Shimla": ["Mall Road", "Lakkar Bazaar", "Chhota Shimla", "Sanjauli", "Tara Devi"],
        "Manali": ["Old Manali", "Mall Road", "Aleo", "Hadimba", "Vashisht"],
        "Dharamshala": ["McLeod Ganj", "Bhagsu", "Kotwali Bazaar", "Dari"]
    },
    "Jharkhand": {
        "Ranchi": ["Main Road", "Lalpur", "Doranda", "Harmu", "Hinoo", "Morabadi"],
        "Jamshedpur": ["Bistupur", "Sakchi", "Sonari", "Kadma", "Telco"],
        "Dhanbad": ["Hirapur", "Saraidhela", "Bank More", "Govindpur"]
    },
    "Karnataka": {
        "Bengaluru": ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "JP Nagar", "Electronic City", "Marathahalli", "Jayanagar"],
        "Mysuru": ["Vijayanagar", "Saraswathipuram", "Gokulam", "Kuvempunagar", "Hebbal"],
        "Hubli": ["Vidyanagar", "Deshpande Nagar", "Keshwapur", "Navanagar"],
        "Mangaluru": ["Hampankatta", "Balmatta", "Kadri", "Bejai", "Kankanady"]
    },
    "Kerala": {
        "Thiruvananthapuram": ["Kowdiar", "Pattom", "Vellayambalam", "Kesavadasapuram", "Kazhakkoottam"],
        "Kochi": ["MG Road", "Edappally", "Kakkanad", "Kaloor", "Fort Kochi", "Aluva"],
        "Kozhikode": ["Palayam", "Mananchira", "Mavoor Road", "Beach", "Feroke"],
        "Thrissur": ["Swaraj Round", "Kokkalai", "Punkunnam", "Ayyanthole"]
    },
    "Madhya Pradesh": {
        "Bhopal": ["MP Nagar", "Arera Colony", "New Market", "Habibganj", "Kolar Road"],
        "Indore": ["Vijay Nagar", "Palasia", "Sapna Sangeeta", "LIG", "Rajwada"],
        "Gwalior": ["Lashkar", "City Centre", "Morar", "Thatipur", "Padav"],
        "Jabalpur": ["Wright Town", "Napier Town", "Madan Mahal", "Adhartal"]
    },
    "Maharashtra": {
        "Mumbai": ["Andheri", "Bandra", "Dadar", "Borivali", "Powai", "Lower Parel", "Goregaon", "Malad"],
        "Pune": ["Kothrud", "Hinjewadi", "Viman Nagar", "Koregaon Park", "Shivajinagar", "Baner", "Hadapsar"],
        "Nagpur": ["Dharampeth", "Sitabuldi", "Sadar", "Civil Lines", "Manewada"],
        "Nashik": ["College Road", "Panchavati", "Nashik Road", "Indira Nagar", "Deolali"]
    },
    "Manipur": {
        "Imphal": ["Thangal Bazaar", "Paona Bazaar", "Singjamei", "Lamphelpat", "Keishampat"]
    },
    "Meghalaya": {
        "Shillong": ["Police Bazaar", "Laitumkhrah", "Lachumiere", "Bara Bazaar", "Mawlai"]
    },
    "Mizoram": {
        "Aizawl": ["Zarkawt", "Bara Bazaar", "Chanmari", "Dawrpui", "Bawngkawn"]
    },
    "Nagaland": {
        "Kohima": ["Main Town", "High School Area", "Kenuozou", "Phoolbari"],
        "Dimapur": ["Circular Road", "Duncan Bosti", "Purana Bazaar", "Khermahal"]
    },
    "Odisha": {
        "Bhubaneswar": ["Saheed Nagar", "Jaydev Vihar", "Patia", "Chandrasekharpur", "Nayapalli"],
        "Cuttack": ["Buxi Bazaar", "College Square", "Badambadi", "Tulsipur"],
        "Rourkela": ["Udit Nagar", "Civil Township", "Sector 19", "Koel Nagar"]
    },
    "Punjab": {
        "Chandigarh": ["Sector 17", "Sector 22", "Sector 35", "Sector 43", "Sector 8"],
        "Ludhiana": ["Sarabha Nagar", "Model Town", "Civil Lines", "Dugri", "Pakhowal Road"],
        "Amritsar": ["Lawrence Road", "Ranjit Avenue", "Hall Bazaar", "GT Road", "Majitha Road"],
        "Jalandhar": ["Model Town", "BMC Chowk", "Lajpat Nagar", "Guru Nanak Pura"]
    },
    "Rajasthan": {
        "Jaipur": ["MI Road", "Vaishali Nagar", "Malviya Nagar", "Mansarovar", "C-Scheme", "Tonk Road"],
        "Jodhpur": ["Sardarpura", "Ratanada", "Paota", "Shastri Nagar", "Pal Road"],
        "Udaipur": ["Fatehpura", "Hiran Magri", "Sukhadia Circle", "Chetak Circle", "Ambamata"],
        "Kota": ["Talwandi", "Gumanpura", "Vigyan Nagar", "Kunhari"]
    },
    "Sikkim": {
        "Gangtok": ["MG Marg", "Deorali", "Tadong", "Tathangchen", "Development Area"]
    },
    "Tamil Nadu": {
        "Chennai": ["T. Nagar", "Adyar", "Anna Nagar", "Velachery", "Mylapore", "Porur", "Tambaram", "OMR"],
        "Coimbatore": ["RS Puram", "Gandhipuram", "Peelamedu", "Saibaba Colony", "Singanallur"],
        "Madurai": ["Anna Nagar", "KK Nagar", "Goripalayam", "Tallakulam", "Thirunagar"],
        "Tiruchirappalli": ["Cantonment", "Thillai Nagar", "Woraiyur", "Srirangam", "KK Nagar"],
        "Salem": ["Fairlands", "Hasthampatti", "Shevapet", "Alagapuram"]
    },
    "Telangana": {
        "Hyderabad": ["Banjara Hills", "Jubilee Hills", "Madhapur", "Gachibowli", "Kukatpally", "Ameerpet", "Begumpet", "Secunderabad"],
        "Warangal": ["Hanamkonda", "Kazipet", "Hunter Road", "Subedari"],
        "Nizamabad": ["Sarangapur", "Dichpally", "Vinayak Nagar", "Pragati Nagar"]
    },
    "Tripura": {
        "Agartala": ["Battala", "Gol Bazar", "GB Road", "Kaman Chowmuhani", "Banamalipur"]
    },
    "Uttar Pradesh": {
        "Lucknow": ["Hazratganj", "Gomti Nagar", "Aminabad", "Alambagh", "Aliganj", "Indira Nagar"],
        "Noida": ["Sector 18", "Sector 62", "Sector 137", "Sector 50", "Sector 76"],
        "Varanasi": ["Godowlia", "Lanka", "Sigra", "Bhelupur", "Cantt"],
        "Kanpur": ["Civil Lines", "Swaroop Nagar", "Kidwai Nagar", "Kakadeo", "Govind Nagar"],
        "Agra": ["Sadar Bazaar", "Tajganj", "Sikandra", "Dayal Bagh", "Kamla Nagar"]
    },
    "Uttarakhand": {
        "Dehradun": ["Rajpur Road", "Clock Tower", "Paltan Bazaar", "Race Course", "Clement Town"],
        "Haridwar": ["Har Ki Pauri", "Jwalapur", "Ranipur", "Shivalik Nagar"],
        "Nainital": ["Mall Road", "Tallital", "Mallital", "Hanumangarhi"]
    },
    "West Bengal": {
        "Kolkata": ["Park Street", "Salt Lake", "New Town", "Gariahat", "Ballygunge", "Howrah", "Dum Dum", "Behala"],
        "Siliguri": ["Hill Cart Road", "Sevoke Road", "Hakimpara", "Pradhan Nagar"],
        "Durgapur": ["City Centre", "Benachity", "Bidhannagar", "Muchipara"],
        "Asansol": ["Burnpur", "Court More", "Sentrum", "Hirapur"]
    }
};

// Populate the State dropdown on page load
function initLocationDropdowns() {
    const stateSelect = document.getElementById('shopState');
    if (!stateSelect) return;

    // Clear and add default option
    stateSelect.innerHTML = '<option value="">Select State</option>';
    Object.keys(locationData).sort().forEach(state => {
        const opt = document.createElement('option');
        opt.value = state;
        opt.textContent = state;
        stateSelect.appendChild(opt);
    });
}

// When State changes → populate City dropdown
function onStateChange() {
    const state = document.getElementById('shopState').value;
    const citySelect = document.getElementById('shopCity');
    const areaSelect = document.getElementById('shopArea');

    // Reset city and area
    citySelect.innerHTML = '<option value="">Select City</option>';
    areaSelect.innerHTML = '<option value="">Select Area</option>';

    if (state && locationData[state]) {
        Object.keys(locationData[state]).sort().forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            citySelect.appendChild(opt);
        });
    }
}

// When City changes → populate Area dropdown
function onCityChange() {
    const state = document.getElementById('shopState').value;
    const city = document.getElementById('shopCity').value;
    const areaSelect = document.getElementById('shopArea');

    // Reset area
    areaSelect.innerHTML = '<option value="">Select Area</option>';

    if (state && city && locationData[state] && locationData[state][city]) {
        locationData[state][city].forEach(area => {
            const opt = document.createElement('option');
            opt.value = area;
            opt.textContent = area;
            areaSelect.appendChild(opt);
        });
    }
}

// Initialize dropdowns when DOM is ready
document.addEventListener('DOMContentLoaded', initLocationDropdowns);
// Also try immediately in case DOM is already loaded
if (document.readyState !== 'loading') {
    initLocationDropdowns();
}
