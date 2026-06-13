const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Favorite = require('../models/Favorite');
const Reservation = require('../models/Reservation');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // 1. Clear database
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany(),
      Pharmacy.deleteMany(),
      Medicine.deleteMany(),
      Review.deleteMany(),
      Notification.deleteMany(),
      Favorite.deleteMany(),
      Reservation.deleteMany(),
    ]);

    // 2. Create Users
    console.log('Seeding users...');
    const users = [
      {
        name: 'System Admin',
        email: 'admin@medlocator.com',
        password: 'password123',
        role: 'admin',
        isVerified: true,
      },
      {
        name: 'Apex Pharmacy Owner',
        email: 'apex@pharmacy.com',
        password: 'password123',
        role: 'pharmacy',
        isVerified: true,
      },
      {
        name: 'City Care Pharmacy Owner',
        email: 'citycare@pharmacy.com',
        password: 'password123',
        role: 'pharmacy',
        isVerified: true,
      },
      {
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
        phone: '+919876543210',
      },
      {
        name: 'Jane Smith',
        email: 'jane@smith.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
        phone: '+919876543211',
      },
    ];

    const seededUsers = await User.create(users);
    const adminUser = seededUsers[0];
    const apexOwner = seededUsers[1];
    const cityCareOwner = seededUsers[2];
    const johnDoe = seededUsers[3];
    const janeSmith = seededUsers[4];

    // 3. Create Pharmacies
    console.log('Seeding pharmacies...');
    const pharmacies = [
      {
        owner: apexOwner._id,
        name: 'Apex Pharmacy & Wellness Center',
        description: 'Providing specialist oncology, neurology, and orphan drugs with quick regional delivery.',
        license: 'DL-98765-ABC',
        phone: '+91 22 2847 1100',
        email: 'contact@apexwellness.com',
        website: 'https://apexwellness.com',
        address: {
          street: '101, Linking Road, Santacruz West',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400054',
          country: 'India',
        },
        location: {
          type: 'Point',
          coordinates: [72.8361, 19.0822], // Longitude, Latitude (Linking Road, Mumbai)
        },
        operatingHours: {
          monday: { open: '08:00', close: '23:00' },
          tuesday: { open: '08:00', close: '23:00' },
          wednesday: { open: '08:00', close: '23:00' },
          thursday: { open: '08:00', close: '23:00' },
          friday: { open: '08:00', close: '23:00' },
          saturday: { open: '08:00', close: '22:00' },
          sunday: { open: '09:00', close: '21:00', closed: false },
        },
        isApproved: true,
        isActive: true,
        deliveryAvailable: true,
        emergencyAvailable: true,
        rating: 4.8,
        totalReviews: 1,
      },
      {
        owner: cityCareOwner._id,
        name: 'City Care Pharmacy',
        description: 'Your trusted neighborhood medical store carrying a wide variety of immunosuppressants and biologics.',
        license: 'DL-12345-XYZ',
        phone: '+91 22 2642 2200',
        email: 'support@citycare.com',
        address: {
          street: 'Shop 4, Hill Road, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400050',
          country: 'India',
        },
        location: {
          type: 'Point',
          coordinates: [72.8286, 19.0583], // Hill Road, Bandra
        },
        operatingHours: {
          monday: { open: '09:00', close: '21:00' },
          tuesday: { open: '09:00', close: '21:00' },
          wednesday: { open: '09:00', close: '21:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '21:00' },
          saturday: { open: '09:00', close: '18:00' },
          sunday: { open: '10:00', close: '14:00', closed: true },
        },
        isApproved: true,
        isActive: true,
        deliveryAvailable: true,
        emergencyAvailable: false,
        rating: 4.2,
        totalReviews: 1,
      },
    ];

    const seededPharmacies = await Pharmacy.create(pharmacies);
    const apexPharmacy = seededPharmacies[0];
    const cityCarePharmacy = seededPharmacies[1];

    console.log('Seeding medicines...');
    
    // 4. Create Medicines
    const medicines = [
      {
        name: 'Remdesivir 100mg Injection',
        genericName: 'Remdesivir',
        brand: 'Covir',
        manufacturer: 'Cipla Ltd',
        description: 'An antiviral medication indicated for the treatment of coronavirus disease 2019 (COVID-19) in hospitalized patients.',
        category: 'Antiviral',
        dosageForm: 'Injection',
        strength: '100mg',
        price: 3400,
        pharmacy: apexPharmacy._id,
        stock: 12,
        requiresPrescription: true,
        sideEffects: ['Nausea', 'Headache', 'Elevated liver enzymes'],
        contraindications: ['Severe renal impairment', 'Hypersensitivity to Remdesivir'],
        rating: 4.5,
        totalReviews: 2,
      },
      {
        name: 'Trastuzumab 440mg Injection',
        genericName: 'Trastuzumab',
        brand: 'Herclon',
        manufacturer: 'Roche Products India',
        description: 'A monoclonal antibody used to treat HER2-positive breast cancer and stomach cancer.',
        category: 'Oncology',
        dosageForm: 'Injection',
        strength: '440mg',
        price: 58000,
        pharmacy: apexPharmacy._id,
        stock: 4,
        requiresPrescription: true,
        sideEffects: ['Fever', 'Nausea', 'Congestive heart failure'],
        contraindications: ['Severe dyspnea at rest', 'Hypersensitivity'],
        rating: 5.0,
        totalReviews: 1,
      },
      {
        name: 'Tacrolimus 1mg Capsules',
        genericName: 'Tacrolimus',
        brand: 'Pangraf',
        manufacturer: 'Panacea Biotec',
        description: 'An immunosuppressive drug used mainly after allogeneic organ transplant to lower the risk of organ rejection.',
        category: 'Immunosuppressants',
        dosageForm: 'Capsule',
        strength: '1mg',
        price: 180,
        pharmacy: cityCarePharmacy._id,
        stock: 25,
        requiresPrescription: true,
        sideEffects: ['Tremor', 'Headache', 'Kidney problems'],
        contraindications: ['Hypersensitivity', 'Concurrent live vaccination'],
        rating: 4.0,
        totalReviews: 1,
      },
      {
        name: 'Amoxicillin 500mg Capsules',
        genericName: 'Amoxicillin',
        brand: 'Novamox',
        manufacturer: 'Cipla',
        description: 'An antibiotic used to treat a number of bacterial infections including middle ear infection, strep throat, and pneumonia.',
        category: 'Antibiotics',
        dosageForm: 'Capsule',
        strength: '500mg',
        price: 90,
        pharmacy: cityCarePharmacy._id,
        stock: 50,
        requiresPrescription: false,
        rating: 4.4,
        totalReviews: 1,
      },
    ];

    const seededMedicines = await Medicine.create(medicines);

    // 5. Seed Reviews (Each user writes only one pharmacy review and/or one medicine review to avoid sparse index collisions)
    console.log('Seeding reviews...');
    const reviews = [
      {
        user: johnDoe._id,
        pharmacy: apexPharmacy._id,
        rating: 5,
        title: 'Life saving pharmacy!',
        comment: 'They had the critical oncology drug that was out of stock everywhere in Mumbai. The pharmacist was very helpful and verified my prescription instantly.',
        isVerifiedPurchase: true,
        helpful: 5,
      },
      {
        user: janeSmith._id,
        pharmacy: cityCarePharmacy._id,
        rating: 4,
        title: 'Good service',
        comment: 'Wide inventory of immunosuppressants. Convenient location on Hill Road.',
        isVerifiedPurchase: true,
        helpful: 2,
      },
      {
        user: johnDoe._id,
        medicine: seededMedicines[0]._id, // Remdesivir
        rating: 5,
        title: 'Authentic product',
        comment: 'Product was sealed, batch code matched, and price was fair.',
        isVerifiedPurchase: true,
        helpful: 3,
      },
    ];

    await Review.create(reviews);

    // Update totalMedicines on Pharmacy model
    await Pharmacy.findByIdAndUpdate(apexPharmacy._id, { totalMedicines: 2 });
    await Pharmacy.findByIdAndUpdate(cityCarePharmacy._id, { totalMedicines: 2 });

    console.log('Database seeded successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

connectDB().then(seedData);
