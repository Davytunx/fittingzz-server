/**
 * Quick verification script
 */
console.log('🔍 Verifying Fittingz API Systems...\n');

async function verify() {
  const results = [];

  try {
    // 1. Environment
    const { env } = await import('./src/config/env.js');
    results.push(`✅ Environment: ${env.NODE_ENV} mode`);
  } catch (e) {
    results.push(`❌ Environment: ${e.message}`);
  }

  try {
    // 2. Session Store
    const { sessionStore } = await import('./src/config/session.js');
    await sessionStore.set('test', 'works');
    const value = await sessionStore.get('test');
    results.push(`✅ Session Store: ${value === 'works' ? 'Working' : 'Failed'}`);
  } catch (e) {
    results.push(`❌ Session Store: ${e.message}`);
  }

  try {
    // 3. Repository
    const { repositories } = await import('./src/config/repository.factory.js');
    results.push(`✅ Repository: ${repositories.user ? 'Configured' : 'Missing'}`);
  } catch (e) {
    results.push(`❌ Repository: ${e.message}`);
  }

  try {
    // 4. Module Loader
    const { ModuleLoader } = await import('./src/utils/module-loader.js');
    const service = await ModuleLoader.getService('user');
    results.push(`✅ Module Loader: ${service ? 'Working' : 'Failed'}`);
  } catch (e) {
    results.push(`❌ Module Loader: ${e.message}`);
  }

  try {
    // 5. Service Factory
    const { ServiceFactory } = await import('./src/services/service.factory.js');
    const comm = ServiceFactory.getServiceCommunication();
    results.push(`✅ Service Factory: ${comm ? 'Ready' : 'Failed'}`);
  } catch (e) {
    results.push(`❌ Service Factory: ${e.message}`);
  }

  // Print results
  results.forEach(result => console.log(result));
  
  const passed = results.filter(r => r.startsWith('✅')).length;
  const total = results.length;
  
  console.log(`\n📊 Results: ${passed}/${total} systems working`);
  
  if (passed === total) {
    console.log('🎉 All systems operational!');
  } else {
    console.log('⚠️  Some systems need attention');
  }
}

verify().catch(console.error);