const xlsx = require('xlsx');

const generateSampleExcel = () => {
  const data = [
    {
      'Roll No': '22A81A0501',
      'Name': 'Aarav Sharma',
      'Email': 'aarav.sharma@example.com',
      'Semester': 'IV Semester B.Tech',
      'Branch': 'CSE',
      'Engineers Day': 'Yes',
      'Tech Trifecta': 'Yes',
      'Coding Challenge': 'No',
      'Quiz Competition': 'Yes'
    },
    {
      'Roll No': '22A81A0502',
      'Name': 'Bhavya Patel',
      'Email': 'bhavya.patel@example.com',
      'Semester': 'IV Semester B.Tech',
      'Branch': 'ECE',
      'Engineers Day': 'Yes',
      'Tech Trifecta': 'No',
      'Coding Challenge': 'Yes',
      'Quiz Competition': 'No'
    },
    {
      'Roll No': '22A81A0503',
      'Name': 'Chirag Reddy',
      'Email': 'chirag.reddy@example.com',
      'Semester': 'IV Semester B.Tech',
      'Branch': 'CSE-AIML',
      'Engineers Day': 'Yes',
      'Tech Trifecta': 'Yes',
      'Coding Challenge': 'Yes',
      'Quiz Competition': 'Yes'
    },
    {
      'Roll No': '22A81A0504',
      'Name': 'Divya Sri',
      'Email': 'divya.sri@example.com',
      'Semester': 'IV Semester B.Tech',
      'Branch': 'IT',
      'Engineers Day': 'No',
      'Tech Trifecta': 'Yes',
      'Coding Challenge': 'No',
      'Quiz Competition': 'Yes'
    },
    {
      'Roll No': '22A81A0505',
      'Name': 'Eshwar Verma',
      'Email': 'eshwar.verma@example.com',
      'Semester': 'IV Semester B.Tech',
      'Branch': 'Mechanical',
      'Engineers Day': 'Yes',
      'Tech Trifecta': 'No',
      'Coding Challenge': 'No',
      'Quiz Competition': 'No'
    }
  ];

  const ws = xlsx.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // Roll No
    { wch: 22 }, // Name
    { wch: 28 }, // Email
    { wch: 20 }, // Semester
    { wch: 15 }, // Branch
    { wch: 16 }, // Engineers Day
    { wch: 16 }, // Tech Trifecta
    { wch: 18 }, // Coding Challenge
    { wch: 18 }  // Quiz Competition
  ];

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Participants');

  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = {
  generateSampleExcel
};
