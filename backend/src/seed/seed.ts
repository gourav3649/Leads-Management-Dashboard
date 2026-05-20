import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Lead } from '../models/Lead.js';

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing database...');
    await User.deleteMany({});
    await Lead.deleteMany({});

    console.log('Creating seed users...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@dashboard.com',
      password: 'password123',
      role: 'admin',
    });

    const salesUser = await User.create({
      name: 'Sales User',
      email: 'sales@dashboard.com',
      password: 'password123',
      role: 'sales',
    });

    console.log('✓ Users created:');
    console.log(`- Admin: admin@dashboard.com (password123)`);
    console.log(`- Sales: sales@dashboard.com (password123)`);

        const names = [
      'Rahul Kumar', 'Amit Sharma', 'Priya Patel', 'Sneha Reddy', 'Vijay Yadav',
      'Gourav Dutt', 'Neha Gupta', 'Rohan Das', 'Karan Johar', 'Simran Gill',
      'Arjun Malhotra', 'Deepika Rao', 'Siddharth Sen', 'Ananya Hegde', 'Kabir Mehta',
      'Aditi Verma', 'Vikram Singh', 'Tanvi Shah', 'Yash Wardhan', 'Pooja Joshi'
    ];

    const companies = [
      'Tech Mahindra', 'Infosys', 'Wipro', 'Tata Consultancy Services', 'Reliance Industries',
      'HDFC Bank', 'ICICI Bank', 'L&T', 'Bharti Airtel', 'Adani Group',
      'HCL Tech', 'Axis Bank', 'Bajaj Finance', 'Maruti Suzuki', 'State Bank of India',
      'ITC Limited', 'Kotak Mahindra', 'Sun Pharma', 'JSW Steel', 'Titan Company'
    ];

    const statuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'] as const;
    const sources = ['Website', 'Instagram', 'Referral'] as const;

    console.log('Creating seed leads...');
    const leads = [];

    for (let i = 0; i < names.length; i++) {
      const creator = i % 2 === 0 ? adminUser : salesUser;
      const status = statuses[i % statuses.length];
      const source = sources[i % sources.length];
      
      const createdAtDate = new Date();
      createdAtDate.setDate(createdAtDate.getDate() - (i % 10));

      leads.push({
        name: names[i],
        email: `${names[i].toLowerCase().replace(/\s/g, '.')}@example.com`,
        phone: `+91 98765 432${i.toString().padStart(2, '0')}`,
        company: companies[i % companies.length],
        status,
        source,
        createdBy: creator._id,
        createdAt: createdAtDate,
        updatedAt: createdAtDate,
      });
    }

    await Lead.insertMany(leads);
    console.log(`✓ Seeded ${leads.length} leads successfully!`);

  } catch (error) {
    console.error('✗ Seeding error:', error);
  } finally {
    await disconnectDB();
    console.log('Disconnected from MongoDB.');
  }
};

seedData();
