import apiService from './services/ApiService';

// Test API connectivity
const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test health check
    const health = await apiService.healthCheck();
    console.log('Health check result:', health);
    
    // Test complaint submission
    const testComplaint = {
      complaint_type: 'missing-person',
      is_anonymous: true,
      incident_date: '2024-11-21',
      incident_time: '15:30',
      location: 'Luanda, Test Location',
      description: 'Test complaint from mobile app',
      type_details: {
        full_name: 'Test Person',
        age: 25,
        gender: 'male',
        physical_description: 'Test description',
        last_seen_location: 'Test location',
        last_seen_date: '2024-11-21',
        last_seen_time: '15:00',
        clothing_description: 'Test clothing',
        relationship_to_reporter: 'friend'
      }
    };
    
    console.log('Submitting test complaint...');
    const complaintResponse = await apiService.submitComplaint(testComplaint);
    console.log('Complaint response:', complaintResponse);
    
    if (complaintResponse.success) {
      // Test search by protocol
      console.log('Testing search by protocol...');
      const searchResponse = await apiService.getComplaintByProtocol(complaintResponse.data.protocol_number);
      console.log('Search response:', searchResponse);
    }
    
  } catch (error) {
    console.error('API test failed:', error);
  }
};

// Run test
testApiConnection();
