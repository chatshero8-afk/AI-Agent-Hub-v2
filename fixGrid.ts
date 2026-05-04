import fs from 'fs';
let content = fs.readFileSync('src/components/templates/SalesDashboardTemplate.tsx', 'utf8');

content = content.replace(
  '<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">\n          <div className="flex flex-col gap-8">',
  '<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">'
);

content = content.replace(
  '</div>\n\n          {/* Monthly Targets */}',
  '\n          {/* Monthly Targets */}'
);

fs.writeFileSync('src/components/templates/SalesDashboardTemplate.tsx', content);
console.log('Done');
