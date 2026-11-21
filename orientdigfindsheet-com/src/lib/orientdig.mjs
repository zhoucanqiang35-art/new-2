export const official = {
  diy: 'https://orientdig.com/diy-order',
  estimate: 'https://orientdig.com/estimation',
  help: 'https://orientdig.com/help-center',
  tutorial: 'https://orientdig.com/help-center-faqs',
};

export const warehouseSample = '7321418559';

const helpArticle = slug => 'https://mgt.orientdig.com/help-center/' + slug + '/';

export const help = {
  buying: helpArticle('shopping-assistant-guidance'),
  statuses: helpArticle('status-of-the-shopping-agent-orders'),
  qc: helpArticle('the-inspection-scope-of-the-shopping-agent-service'),
  storage: helpArticle('the-duration-for-which-goods-can-be-stored-in-the-orientdig-warehouse-is-90-days'),
  returns: helpArticle('terms-of-promised-returns-with-no-reasons'),
  weight: helpArticle('estimated-billing-weight-and-actual-billing-weight-when-will-the-overcharged-postage-be-refunded'),
  logistics: helpArticle('logistics-platform-introduction'),
  packing: helpArticle('value-added-services'),
  customs: helpArticle('what-are-the-customs-risks'),
};
