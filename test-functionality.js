// Comprehensive functionality testing script
async function testAPIEndpoints() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🔄 Testing API Endpoints...\n');
  
  // Test properties endpoint
  try {
    const propertiesResponse = await fetch(`${baseUrl}/api/properties?limit=3`);
    const properties = await propertiesResponse.json();
    console.log('✅ Properties API:', properties.length, 'properties loaded');
    console.log('   Sample property:', properties[0]?.title?.substring(0, 30) + '...');
  } catch (error) {
    console.log('❌ Properties API failed:', error.message);
  }
  
  // Test leads endpoint  
  try {
    const leadsResponse = await fetch(`${baseUrl}/api/leads?limit=3`);
    const leads = await leadsResponse.json();
    console.log('✅ Leads API:', leads.length, 'leads loaded');
    console.log('   Sample lead:', leads[0]?.name, '-', leads[0]?.email);
  } catch (error) {
    console.log('❌ Leads API failed:', error.message);
  }
  
  // Test agents endpoint
  try {
    const agentsResponse = await fetch(`${baseUrl}/api/agents`);
    const agents = await agentsResponse.json();
    console.log('✅ Agents API:', agents.length, 'agents loaded');
    console.log('   Sample agent:', agents[0]?.name, '-', agents[0]?.email);
  } catch (error) {
    console.log('❌ Agents API failed:', error.message);
  }
  
  console.log('\n🔄 Testing Search Functionality...\n');
  
  // Test property search
  try {
    const searchResponse = await fetch(`${baseUrl}/api/properties?propertyType=apartment&limit=3`);
    const searchResults = await searchResponse.json();
    console.log('✅ Property Search:', searchResults.length, 'apartments found');
  } catch (error) {
    console.log('❌ Property Search failed:', error.message);
  }
  
  // Test lead filtering
  try {
    const leadFilterResponse = await fetch(`${baseUrl}/api/leads?status=new&limit=5`);
    const filteredLeads = await leadFilterResponse.json();
    console.log('✅ Lead Filtering:', filteredLeads.length, 'new leads found');
  } catch (error) {
    console.log('❌ Lead Filtering failed:', error.message);
  }
}

// Run tests
testAPIEndpoints().then(() => {
  console.log('\n✨ API Testing Complete');
}).catch(error => {
  console.log('\n❌ Testing failed:', error.message);
});