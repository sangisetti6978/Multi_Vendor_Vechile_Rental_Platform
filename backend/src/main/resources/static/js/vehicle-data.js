// Vehicle Type → Brand → Model cascading data
const vehicleData = {
    "CAR": {
        "Maruti Suzuki": ["Swift", "Dzire", "Alto K10", "Baleno", "WagonR", "Brezza", "Ciaz", "Ertiga", "Celerio", "S-Presso"],
        "Hyundai": ["i20", "Creta", "Venue", "Verna", "Aura", "Grand i10 Nios", "Alcazar", "Exter", "i10"],
        "Honda": ["City", "Amaze", "Elevate", "Jazz", "WR-V"],
        "Toyota": ["Innova Crysta", "Glanza", "Urban Cruiser Hyryder", "Camry", "Innova Hycross"],
        "Tata": ["Nexon", "Altroz", "Punch", "Tigor", "Tiago"],
        "Kia": ["Seltos", "Sonet", "Carens", "EV6"],
        "Mahindra": ["XUV300", "Bolero", "Marazzo", "KUV100"],
        "Volkswagen": ["Virtus", "Taigun", "Polo", "Vento"],
        "Skoda": ["Slavia", "Kushaq", "Superb", "Octavia"],
        "MG": ["Astor", "ZS EV"],
        "Renault": ["Kwid", "Triber", "Kiger"],
        "Nissan": ["Magnite", "Kicks"]
    },
    "BIKE": {
        "Hero": ["Splendor Plus", "HF Deluxe", "Passion Pro", "Xtreme 160R", "Glamour", "Xpulse 200", "Super Splendor"],
        "Honda": ["Shine", "Unicorn", "SP 125", "Hornet 2.0", "CB350", "Highness CB350", "CB200X"],
        "Bajaj": ["Pulsar 150", "Pulsar NS200", "Pulsar RS200", "Dominar 400", "Platina", "Avenger 220", "CT 125"],
        "Royal Enfield": ["Classic 350", "Bullet 350", "Meteor 350", "Himalayan", "Hunter 350", "Continental GT", "Interceptor 650"],
        "TVS": ["Apache RTR 160", "Apache RTR 200", "Raider 125", "Star City Plus", "Sport", "Ronin"],
        "Yamaha": ["FZ-S V3", "FZ-X", "R15 V4", "MT-15 V2", "FZ 25"],
        "KTM": ["Duke 200", "Duke 390", "RC 200", "RC 390", "Duke 250", "Adventure 390"],
        "Suzuki": ["Gixxer", "Gixxer SF", "Gixxer 250", "Hayabusa", "Intruder"],
        "Kawasaki": ["Ninja 300", "Ninja 650", "Z650", "Versys 650", "W175"],
        "Jawa": ["Jawa 42", "Jawa Classic", "Perak"]
    },
    "SCOOTER": {
        "Honda": ["Activa 6G", "Dio", "Grazia", "Activa 125"],
        "TVS": ["Jupiter", "Ntorq 125", "Scooty Pep Plus", "Scooty Zest", "iQube"],
        "Suzuki": ["Access 125", "Burgman Street", "Avenis"],
        "Hero": ["Pleasure Plus", "Destini 125", "Maestro Edge"],
        "Ola": ["S1 Pro", "S1 Air", "S1 X"],
        "Ather": ["450X", "450S", "Rizta"],
        "Bajaj": ["Chetak"],
        "Yamaha": ["Fascino", "Ray ZR", "Aerox 155"]
    },
    "SUV": {
        "Mahindra": ["XUV700", "Scorpio-N", "Thar", "XUV300", "Bolero Neo", "XUV400"],
        "Tata": ["Harrier", "Safari", "Punch", "Nexon EV"],
        "Hyundai": ["Creta", "Tucson", "Venue", "Alcazar"],
        "Kia": ["Seltos", "Sonet", "Carens", "EV6"],
        "Toyota": ["Fortuner", "Urban Cruiser Hyryder", "Innova Hycross"],
        "MG": ["Hector", "Hector Plus", "Gloster", "Astor", "ZS EV"],
        "Jeep": ["Compass", "Meridian", "Wrangler", "Grand Cherokee"],
        "Maruti Suzuki": ["Brezza", "Grand Vitara", "Jimny"],
        "Skoda": ["Kushaq", "Kodiaq"],
        "Volkswagen": ["Taigun", "Tiguan"]
    },
    "VAN": {
        "Maruti Suzuki": ["Eeco"],
        "Tata": ["Winger", "Magic"],
        "Force": ["Traveller", "Urbania", "Gurkha"],
        "Mahindra": ["Supro", "Bolero MaXX"],
        "Toyota": ["HiAce"],
        "Renault": ["Trafic"]
    },
    "TRUCK": {
        "Tata": ["Ace Gold", "Ace EV", "Ultra", "Prima", "Intra V30"],
        "Mahindra": ["Bolero Pickup", "Supro Profit Truck", "Jayo"],
        "Ashok Leyland": ["Dost", "Partner", "Bada Dost", "Ecomet"],
        "Eicher": ["Pro 2049", "Pro 3015", "Pro 6000"],
        "BharatBenz": ["1015R", "1415R", "2823R"],
        "Isuzu": ["D-Max", "S-CAB", "Hi-Lander"]
    }
};

// When Vehicle Type changes → populate Brand dropdown
function onVehicleTypeChange() {
    const type = document.getElementById('vehicleTypeSelect').value;
    const brandSelect = document.getElementById('vehicleBrandSelect');
    const modelSelect = document.getElementById('vehicleModelSelect');
    const nameInput = document.getElementById('vehicleNameInput');

    // Reset brand, model, and name
    brandSelect.innerHTML = '<option value="">Select Brand</option>';
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    nameInput.value = '';

    if (type && vehicleData[type]) {
        Object.keys(vehicleData[type]).sort().forEach(brand => {
            const opt = document.createElement('option');
            opt.value = brand;
            opt.textContent = brand;
            brandSelect.appendChild(opt);
        });
    }
}

// When Brand changes → populate Model dropdown
function onVehicleBrandChange() {
    const type = document.getElementById('vehicleTypeSelect').value;
    const brand = document.getElementById('vehicleBrandSelect').value;
    const modelSelect = document.getElementById('vehicleModelSelect');
    const nameInput = document.getElementById('vehicleNameInput');

    // Reset model and name
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    nameInput.value = '';

    if (type && brand && vehicleData[type] && vehicleData[type][brand]) {
        vehicleData[type][brand].forEach(model => {
            const opt = document.createElement('option');
            opt.value = model;
            opt.textContent = model;
            modelSelect.appendChild(opt);
        });
    }
}

// Auto-fill vehicle name when model is selected
document.addEventListener('DOMContentLoaded', function() {
    const modelSelect = document.getElementById('vehicleModelSelect');
    if (modelSelect) {
        modelSelect.addEventListener('change', function() {
            const brand = document.getElementById('vehicleBrandSelect').value;
            const model = this.value;
            const nameInput = document.getElementById('vehicleNameInput');
            if (brand && model) {
                nameInput.value = brand + ' ' + model;
            }
        });
    }
});
