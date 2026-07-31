const url = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://nicevx.com/&strategy=mobile';
fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      console.error(data.error);
      return;
    }
    const lh = data.lighthouseResult;
    if (!lh) {
      console.log('No lighthouse result');
      return;
    }
    const score = lh.categories.performance.score * 100;
    
    console.log('--- SCORE ---');
    console.log('Performance:', score);
    
    console.log('\n--- METRICS ---');
    console.log('FCP:', lh.audits['first-contentful-paint'].displayValue);
    console.log('LCP:', lh.audits['largest-contentful-paint'].displayValue);
    console.log('TBT:', lh.audits['total-blocking-time'].displayValue);
    console.log('CLS:', lh.audits['cumulative-layout-shift'].displayValue);
    console.log('Speed Index:', lh.audits['speed-index'].displayValue);
    
    console.log('\n--- OPPORTUNITIES ---');
    Object.values(lh.audits)
      .filter(a => a.details && a.details.type === 'opportunity' && a.score !== null && a.score < 0.9)
      .forEach(a => console.log(`- ${a.title}: Save ${a.details.overallSavingsMs}ms`));
      
    console.log('\n--- DIAGNOSTICS ---');
    Object.values(lh.audits)
      .filter(a => a.details && (a.details.type === 'table' || a.details.type === 'debugdata') && a.score !== null && a.score < 1)
      .forEach(a => console.log(`- ${a.title}`));
  })
  .catch(err => console.error(err));
