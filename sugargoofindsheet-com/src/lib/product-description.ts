import {categoryLabel,priceLabel,type Product} from './catalog';
const checks:Record<string,string[]>={
 'shoes':['Fit and sizing: compare your foot length with the seller’s own size chart. Verify the exact size system and model version before choosing an option.','Inspect the toe shape, upper panels, heel structure, sole edges and outsole pattern. Compare the left and right shoe, labels and any included accessories in your own warehouse photos.'],
 'hoodies-sweaters':['Fit and measurements: compare chest width, shoulder width, sleeve length and garment length with a hoodie or sweater that fits you. Check whether the cut is regular, cropped or oversized on the seller page.','Review front and back views, cuffs, hem, collar or hood, embroidery or print, and any zipper or drawstrings visible in the listing. Fabric composition and garment weight require confirmation from the seller.'],
 't-shirts':['Compare chest width, shoulder width and body length using the seller’s garment measurements. Confirm the selected color, neckline and print version.','Inspect the collar, seams, print placement and front/back images. Images alone cannot establish fabric composition or print durability.'],
 'pants-shorts':['Compare waist, rise, hip, thigh and inseam measurements with clothing you own. Check whether the waist measurement is flat, stretched or a circumference.','Review pockets, waistband, closures, hems and any print or embroidery. Confirm the selected length and color before paying.'],
 'jackets':['Check shoulder, chest, sleeve and body measurements and allow room for the layers you intend to wear underneath. Confirm the exact variant and included lining.','Inspect closures, pockets, cuffs, seams and lining photos where provided. Filling material, insulation weight and weather resistance must be verified from seller specifications.'],
 'jersey':['Confirm the team, season, player/number and selected sizing version with the seller. Compare chest and length measurements rather than relying only on a size label.','Review the front/back artwork, name and number placement, crest and sleeve details. Verify whether personalization is included and whether it affects return eligibility.'],
 'electronics':['Confirm the exact model, plug type, charging standard, voltage and included accessories using the seller’s technical specifications. Check compatibility with your existing devices.','Inspect the casing, ports, labels and packaging. Appearance photos do not prove functional performance; request any available functional check and confirm battery-related shipping restrictions.'],
};
export function productCopy(product: Product) {
 const category = categoryLabel(product.category);
 const paragraphs=[product.name+' is listed in '+category+' in the FindSpreadsheet catalog. This page refers specifically to Weidian item '+product.weidianId+'. Compare this identifier when opening seller or agent links so that similar product names are not confused.',
 'The reference price is displayed above. Use the currency selector to compare the reference amount in another currency. Variant prices, seller stock and the final checkout amount may have changed; domestic delivery, international freight and optional services are additional costs.',
 ...(checks[product.category]||['Check the seller’s dimensions, size or model options, materials and included accessories. Compare the selected version with the listing images and your requirements.','Inspect all available views, labels, closures, finish and packaging where visible. Confirm any specification that is not explicitly provided by the seller.']),
 'Use the listing gallery for style and option comparison and the warehouse section for any available historical inspection images. When no warehouse record exists, seller pictures are identified as listing reference photos. Your own order’s QC images are the relevant record for the unit you actually receive.',
 'Before ordering, verify the exact variant, measurements, quantity, return eligibility and route restrictions on the selected agent. This catalog does not provide verified material composition, item weight, stock or authenticity certification; those fields cannot be inferred reliably from a product title or photograph.'];
 const facts = [['Product',product.name],['Category',category],['Weidian item ID',product.weidianId],['Catalog record',product.id],['Source marketplace','Weidian'],['Price basis','Saved seller price; delivery and services excluded']];
 return { paragraphs, facts };
}

export function describeProduct(product: Product) {
 const { paragraphs, facts } = productCopy(product);
 const area = document.querySelector('#product-description')!;
 area.replaceChildren(...paragraphs.map(text=>{const p=document.createElement('p');p.textContent=text;return p}));
 const list = document.querySelector('#product-facts')!;
 list.replaceChildren(...facts.map(([key,value])=>{const div=document.createElement('div');const dt=document.createElement('dt');const dd=document.createElement('dd');dt.textContent=key;dd.textContent=value;div.append(dt,dd);return div}));
}
