import {expandedEnglish} from './articles-expanded.js';
import {articlesDe} from './articles-de.js';
import {articlesFr} from './articles-fr.js';
import {articlesEs} from './articles-es.js';
import {articlesIt} from './articles-it.js';
import {articlesPt} from './articles-pt.js';
import {articlesNl} from './articles-nl.js';
import {articlesPl} from './articles-pl.js';
import {articlesSv} from './articles-sv.js';
import {localizedFaqAnswers} from './faq-answers-localized.js';
// Independent editorial guidance based on the public PikoBuy shopping guide and shipping estimator, reviewed 2026-10-29.
const data = {
en: [
['PikoBuy Spreadsheet: How to Find Products','A PikoBuy spreadsheet is a starting point for comparing product links, not a guarantee that an item is still in stock. Browse a category or search by name, then open the product details and verify the original listing. The catalog here is an export dated October 19, 2026, so its prices, photographs and availability can change. Record the exact seller, product and variant before ordering.'],
['How to Order With PikoBuy','PikoBuy describes a process in which you find an item on a marketplace such as Weidian, Taobao or 1688, then submit its link or search for it on PikoBuy. Select the desired specifications and quantity, review the displayed purchase price and pay for the order. The item is sent to its warehouse; international delivery is arranged in a later step.'],
['Choosing the Right Size and Variant','Before paying, compare the listing’s measurements with a similar item you already own. Check the size chart, colour, quantity and product options carefully, because marketplace sizes and names can vary by seller. Save the selected listing and options so that you can compare them with the warehouse photographs when the item arrives.'],
['PikoBuy Quality Control Photos','PikoBuy’s shopping guide says items are checked into the warehouse and photographed. Compare the visible colour, quantity, stitching, closures and obvious damage against your order; ask for a useful measurement or another angle if the available images leave a question. A photo can help reveal visible issues but cannot establish authenticity or guarantee how an item will wear.'],
['Understanding PikoBuy Costs','The item price is only part of the budget. Check the current seller-to-warehouse charge, any applicable service or payment charges, international shipping and possible destination taxes or customs costs before you commit. PikoBuy’s guide treats the initial purchase and international shipping as separate payments. Prices shown in the catalog are estimates from a dated export, not a final quote.'],
['Estimating International Shipping','PikoBuy’s shipping estimator asks for a destination, product type, weight and parcel dimensions. Enter realistic figures to compare options, but treat the result as an estimate: actual packed weight, dimensions, restrictions and route availability can change the final charge. Check the current quote and delivery conditions in your account before paying for shipment.'],
['Choosing a Shipping Route','Available routes can differ by destination, eligible product type, billing method and delivery time. Compare their current restrictions, tracking and packaging options with your needs before submitting the parcel. Electronics and other restricted goods may require special handling, so check eligibility on the actual route rather than assuming that every item can travel together.'],
['Preparing and Tracking a Parcel','After the items reach the warehouse, review their condition and decide how to pack the parcel. PikoBuy’s guide mentions packaging requests such as minimal or reinforced packaging; confirm what is offered and any charge before submitting. Once dispatched, follow the tracking information in your order and allow time for carrier scans to appear.'],
['Out-of-Stock Items and After-Sales Help','A marketplace listing can change after it is saved. PikoBuy’s guide says an out-of-stock purchase is refunded; for other problems, contact its support and provide the order number, relevant photos and a clear description. Return eligibility, costs and deadlines may depend on the seller and the order stage, so confirm current conditions before sending anything back.'],
['Using Product Details and QC Responsibly','Open the matching product page on this site to review the exported record and use the PikoBuy purchase button when a valid source link is available. Some records do not include a usable purchase ID, and QC photos are shown only when the source provides them. Check the live purchase page for current variants, price and availability before ordering.']
],
de:[
['PikoBuy Spreadsheet: Produkte finden','Durchsuche Kategorien oder Namen und öffne die Produktdetails. Der Export vom 19. Oktober 2026 ist eine Momentaufnahme; prüfe Preis, Bestand und Variante beim aktuellen Angebot.'],
['Bei PikoBuy bestellen','Suche einen Artikel auf Weidian, Taobao oder 1688 und übermittle den Link an PikoBuy. Wähle Variante und Menge, bezahle den Einkauf und plane den internationalen Versand später separat.'],
['Größe und Variante wählen','Vergleiche die Größentabelle mit einem passenden Kleidungsstück. Prüfe Farbe, Menge und alle Optionen und bewahre die Angaben für den Vergleich mit Lagerfotos auf.'],
['PikoBuy Qualitätskontrolle und Fotos','Laut Einkaufsanleitung werden eingegangene Artikel geprüft und fotografiert. Vergleiche Farbe, Nähte, Verschlüsse und Schäden; frage bei Bedarf nach Maßen oder einem anderen Blickwinkel. Fotos beweisen weder Echtheit noch Haltbarkeit.'],
['PikoBuy Kosten verstehen','Berücksichtige Artikelpreis, möglichen Inlandsversand, zusätzliche Gebühren, internationalen Versand und mögliche Abgaben. Einkauf und internationaler Versand werden getrennt bezahlt; der endgültige Betrag steht im aktuellen Angebot.'],
['Internationalen Versand schätzen','Der PikoBuy-Rechner berücksichtigt Ziel, Produkttyp, Gewicht und Paketmaße. Das Ergebnis ist eine Schätzung; prüfe den endgültigen Preis und die Bedingungen vor Zahlung.'],
['Eine Versandroute auswählen','Vergleiche verfügbare Routen nach Ziel, Produkttyp, Abrechnung, Laufzeit und Einschränkungen. Prüfe besonders bei Elektronik, ob die gewählte Route alle Artikel zulässt.'],
['Paket vorbereiten und verfolgen','Prüfe die Lagerfotos und wähle eine geeignete Verpackung. PikoBuy nennt einfache oder verstärkte Verpackung als mögliche Wünsche; prüfe Angebot und Preis und verfolge das Paket nach dem Versand.'],
['Nicht verfügbare Artikel und Hilfe','Laut PikoBuy wird ein nicht verfügbarer Kauf erstattet. Bei anderen Problemen kontaktiere den Support mit Bestellnummer und Fotos; Rückgabe, Fristen und Kosten hängen vom Einzelfall ab.'],
['Produktdetails und QC richtig nutzen','Öffne die Produktseite und nutze den Kaufknopf, wenn ein gültiger Link vorhanden ist. QC-Fotos erscheinen nur, wenn die Quelle sie bereitstellt; prüfe Preis, Bestand und Optionen vor der Bestellung.']
],
fr:[
['PikoBuy Spreadsheet : trouver des produits','Parcourez les catégories ou recherchez un nom, puis ouvrez la fiche. L’export du 19 octobre 2026 est une photo à une date donnée : vérifiez prix, stock et variante sur l’annonce actuelle.'],
['Commander avec PikoBuy','Trouvez un article sur Weidian, Taobao ou 1688 et transmettez son lien à PikoBuy. Choisissez la variante et la quantité, payez l’achat, puis organisez séparément l’expédition internationale.'],
['Choisir la taille et la variante','Comparez le tableau de mesures à un vêtement qui vous va. Vérifiez couleur, quantité et options, puis conservez ces détails pour les comparer aux photos de l’entrepôt.'],
['Photos de contrôle qualité PikoBuy','Le guide PikoBuy indique que les articles reçus sont inspectés et photographiés. Comparez couleur, coutures, fermetures et défauts ; demandez une mesure ou un autre angle si nécessaire. Une photo ne prouve ni authenticité ni durabilité.'],
['Comprendre les coûts PikoBuy','Prévoyez le prix de l’article, le transport intérieur éventuel, les frais applicables, l’expédition internationale et les taxes possibles. Achat et expédition internationale sont payés séparément ; vérifiez les montants actuels.'],
['Estimer la livraison internationale','L’estimateur PikoBuy utilise destination, type de produit, poids et dimensions. Le résultat reste indicatif : vérifiez le devis et les conditions définitives avant de payer.'],
['Choisir une ligne de livraison','Comparez les lignes disponibles selon destination, produits autorisés, facturation, délai et restrictions. Pour l’électronique notamment, vérifiez que chaque article est accepté par la ligne choisie.'],
['Préparer et suivre un colis','Vérifiez les photos de l’entrepôt et choisissez un emballage adapté. PikoBuy mentionne les demandes d’emballage minimal ou renforcé : vérifiez disponibilité et prix, puis suivez le colis après expédition.'],
['Rupture de stock et assistance','Selon le guide PikoBuy, un achat indisponible est remboursé. Pour tout autre problème, contactez l’assistance avec numéro de commande et photos ; retours, délais et frais dépendent du cas.'],
['Utiliser les fiches et photos QC','Ouvrez la fiche produit et utilisez le bouton d’achat lorsqu’un lien valide existe. Les photos QC n’apparaissent que si la source les fournit ; vérifiez prix, stock et options avant commande.']
],
es:[
['PikoBuy Spreadsheet: encontrar productos','Explora las categorías o busca por nombre y abre la ficha. La exportación del 19 de octubre de 2026 es una instantánea: comprueba precio, stock y variante en el anuncio actual.'],
['Cómo comprar con PikoBuy','Busca un artículo en Weidian, Taobao o 1688 y envía el enlace a PikoBuy. Selecciona variante y cantidad, paga la compra y organiza después el envío internacional por separado.'],
['Elegir talla y variante','Compara la tabla de medidas con una prenda que te quede bien. Revisa color, cantidad y opciones, y guarda los datos para compararlos con las fotos del almacén.'],
['Fotos de control de calidad PikoBuy','Según la guía de PikoBuy, los artículos recibidos se inspeccionan y fotografían. Compara color, costuras, cierres y daños; pide medidas u otro ángulo si hace falta. Las fotos no prueban autenticidad ni durabilidad.'],
['Entender los costes de PikoBuy','Considera el precio del artículo, el posible transporte nacional, los cargos aplicables, el envío internacional y posibles impuestos. La compra y el envío internacional se pagan por separado; revisa los importes actuales.'],
['Calcular el envío internacional','El estimador de PikoBuy utiliza destino, tipo de producto, peso y dimensiones. El resultado es orientativo: revisa el precio y las condiciones definitivas antes de pagar.'],
['Elegir una ruta de envío','Compara rutas por destino, productos admitidos, facturación, plazo y restricciones. En especial para electrónica, verifica que la ruta elegida admita todos los artículos.'],
['Preparar y seguir un paquete','Revisa las fotos del almacén y elige un embalaje adecuado. PikoBuy menciona solicitudes de embalaje mínimo o reforzado; confirma disponibilidad y precio y sigue el paquete tras el envío.'],
['Productos agotados y asistencia','La guía de PikoBuy indica que una compra agotada se reembolsa. Para otros problemas contacta con soporte y aporta número de pedido y fotos; devoluciones, plazos y costes dependen del caso.'],
['Usar fichas y fotos QC','Abre la ficha del producto y usa el botón de compra cuando haya un enlace válido. Las fotos QC solo aparecen si la fuente las ofrece; comprueba precio, stock y opciones antes de comprar.']
],
it:[
['PikoBuy Spreadsheet: trovare prodotti','Esplora le categorie o cerca per nome e apri la scheda. L’esportazione del 19 ottobre 2026 è un’istantanea: verifica prezzo, disponibilità e variante nell’annuncio attuale.'],
['Come ordinare con PikoBuy','Trova un articolo su Weidian, Taobao o 1688 e invia il link a PikoBuy. Scegli variante e quantità, paga l’acquisto e organizza separatamente la spedizione internazionale.'],
['Scegliere taglia e variante','Confronta la tabella misure con un capo che ti veste bene. Controlla colore, quantità e opzioni e conserva i dettagli per confrontarli con le foto del magazzino.'],
['Foto di controllo qualità PikoBuy','La guida PikoBuy indica che gli articoli ricevuti vengono controllati e fotografati. Confronta colore, cuciture, chiusure e danni; chiedi misure o un’altra angolazione se serve. Le foto non provano autenticità o durata.'],
['Capire i costi PikoBuy','Considera prezzo del prodotto, eventuale trasporto interno, commissioni applicabili, spedizione internazionale e possibili imposte. Acquisto e spedizione internazionale si pagano separatamente; verifica gli importi attuali.'],
['Stimare la spedizione internazionale','Il calcolatore PikoBuy usa destinazione, tipo di prodotto, peso e dimensioni. Il risultato è indicativo: controlla preventivo e condizioni definitive prima di pagare.'],
['Scegliere una linea di spedizione','Confronta le linee per destinazione, prodotti ammessi, calcolo del prezzo, tempi e restrizioni. Per l’elettronica verifica che la linea scelta accetti tutti gli articoli.'],
['Preparare e tracciare un pacco','Controlla le foto del magazzino e scegli un imballaggio adatto. PikoBuy menziona richieste di imballaggio minimo o rinforzato; verifica disponibilità e costo e traccia il pacco dopo la spedizione.'],
['Articoli esauriti e assistenza','La guida PikoBuy indica il rimborso per un acquisto esaurito. Per altri problemi contatta l’assistenza con numero d’ordine e foto; resi, termini e costi dipendono dal caso.'],
['Usare schede prodotto e foto QC','Apri la scheda e usa il pulsante di acquisto quando esiste un link valido. Le foto QC appaiono solo se disponibili nella fonte; verifica prezzo, disponibilità e opzioni prima di ordinare.']
],
pt:[
['PikoBuy Spreadsheet: encontrar produtos','Explore categorias ou pesquise pelo nome e abra a ficha. A exportação de 19 de outubro de 2026 é uma fotografia daquele momento: confira preço, estoque e variante no anúncio atual.'],
['Como comprar com PikoBuy','Encontre um item no Weidian, Taobao ou 1688 e envie o link ao PikoBuy. Escolha variante e quantidade, pague a compra e organize o envio internacional separadamente depois.'],
['Escolher tamanho e variante','Compare a tabela de medidas com uma peça que sirva bem. Confira cor, quantidade e opções e guarde os detalhes para compará-los às fotos do armazém.'],
['Fotos de controle de qualidade PikoBuy','O guia PikoBuy informa que os itens recebidos são inspecionados e fotografados. Compare cor, costuras, fechos e danos; peça medidas ou outro ângulo se necessário. Fotos não comprovam autenticidade nem durabilidade.'],
['Entender os custos PikoBuy','Considere preço do item, possível frete interno, taxas aplicáveis, envio internacional e possíveis impostos. Compra e envio internacional são pagos separadamente; confira os valores atuais.'],
['Estimar o envio internacional','O estimador PikoBuy usa destino, tipo de produto, peso e dimensões. O resultado é apenas uma estimativa: confira preço e condições finais antes de pagar.'],
['Escolher uma rota de envio','Compare rotas por destino, produtos permitidos, cobrança, prazo e restrições. Para eletrônicos especialmente, confira se a rota escolhida aceita todos os itens.'],
['Preparar e rastrear um pacote','Confira as fotos do armazém e escolha embalagem adequada. PikoBuy menciona pedidos de embalagem mínima ou reforçada; confirme disponibilidade e preço e acompanhe o pacote após o envio.'],
['Itens esgotados e suporte','O guia PikoBuy informa que uma compra sem estoque é reembolsada. Em outros problemas, contate o suporte com número do pedido e fotos; devoluções, prazos e custos dependem do caso.'],
['Usar fichas e fotos QC','Abra a ficha e use o botão de compra quando houver link válido. As fotos QC aparecem somente quando fornecidas pela fonte; confira preço, estoque e opções antes de pedir.']
],
nl:[
['PikoBuy Spreadsheet: producten vinden','Bekijk categorieën of zoek op naam en open het product. De export van 19 oktober 2026 is een momentopname: controleer prijs, voorraad en uitvoering bij de actuele aanbieding.'],
['Bestellen met PikoBuy','Zoek een artikel op Weidian, Taobao of 1688 en stuur de link naar PikoBuy. Kies uitvoering en aantal, betaal de aankoop en regel internationale verzending later apart.'],
['Maat en uitvoering kiezen','Vergelijk de maattabel met een kledingstuk dat goed past. Controleer kleur, aantal en opties en bewaar de gegevens om ze met de magazijnfoto’s te vergelijken.'],
['PikoBuy kwaliteitscontrole en foto’s','Volgens de PikoBuy-gids worden ontvangen artikelen gecontroleerd en gefotografeerd. Vergelijk kleur, naden, sluitingen en schade; vraag zo nodig om maten of een andere hoek. Foto’s bewijzen geen echtheid of duurzaamheid.'],
['PikoBuy kosten begrijpen','Houd rekening met artikelprijs, eventuele binnenlandse verzending, toepasselijke kosten, internationale verzending en mogelijke belastingen. Aankoop en internationale verzending worden apart betaald; controleer de actuele bedragen.'],
['Internationale verzending schatten','De PikoBuy-calculator gebruikt bestemming, producttype, gewicht en afmetingen. Het resultaat is een schatting; controleer de definitieve prijs en voorwaarden voordat je betaalt.'],
['Een verzendroute kiezen','Vergelijk beschikbare routes op bestemming, toegestane producten, prijsberekening, levertijd en beperkingen. Controleer vooral bij elektronica of alle artikelen op de gekozen route zijn toegestaan.'],
['Een pakket voorbereiden en volgen','Bekijk de magazijnfoto’s en kies passende verpakking. PikoBuy noemt minimale of verstevigde verpakking als mogelijke wensen; controleer beschikbaarheid en prijs en volg het pakket na verzending.'],
['Uitverkochte artikelen en hulp','Volgens de PikoBuy-gids wordt een uitverkochte aankoop terugbetaald. Neem bij andere problemen contact op met support met bestelnummer en foto’s; retourvoorwaarden, termijnen en kosten verschillen per geval.'],
['Productdetails en QC gebruiken','Open de productpagina en gebruik de koopknop wanneer een geldige link beschikbaar is. QC-foto’s verschijnen alleen als de bron ze biedt; controleer prijs, voorraad en opties voor je bestelt.']
],
pl:[
['PikoBuy Spreadsheet: wyszukiwanie produktów','Przeglądaj kategorie lub szukaj po nazwie i otwórz szczegóły. Eksport z 19 października 2026 to zapis z danego dnia: sprawdź aktualną cenę, dostępność i wariant w ofercie.'],
['Jak zamawiać przez PikoBuy','Znajdź produkt na Weidian, Taobao lub 1688 i przekaż link do PikoBuy. Wybierz wariant i ilość, zapłać za zakup, a wysyłkę międzynarodową zorganizuj osobno później.'],
['Wybór rozmiaru i wariantu','Porównaj tabelę wymiarów z dobrze pasującym ubraniem. Sprawdź kolor, ilość i opcje oraz zachowaj szczegóły do porównania ze zdjęciami z magazynu.'],
['Zdjęcia kontroli jakości PikoBuy','Według poradnika PikoBuy otrzymane produkty są sprawdzane i fotografowane. Porównaj kolor, szwy, zapięcia i uszkodzenia; w razie potrzeby poproś o pomiar lub inne ujęcie. Zdjęcia nie dowodzą autentyczności ani trwałości.'],
['Koszty PikoBuy','Uwzględnij cenę produktu, ewentualną przesyłkę krajową, obowiązujące opłaty, wysyłkę międzynarodową i możliwe podatki. Zakup i wysyłka międzynarodowa są płatne osobno; sprawdź aktualne kwoty.'],
['Szacowanie wysyłki międzynarodowej','Kalkulator PikoBuy uwzględnia kraj, rodzaj produktu, wagę i wymiary paczki. Wynik jest szacunkowy; przed zapłatą sprawdź ostateczną cenę i warunki.'],
['Wybór linii wysyłki','Porównaj linie pod kątem kraju, dozwolonych produktów, naliczania opłat, czasu i ograniczeń. Zwłaszcza przy elektronice sprawdź, czy wybrana linia przyjmuje wszystkie produkty.'],
['Przygotowanie i śledzenie paczki','Sprawdź zdjęcia magazynowe i wybierz odpowiednie opakowanie. PikoBuy wymienia prośby o minimalne lub wzmocnione opakowanie; sprawdź dostępność i cenę, a po wysyłce śledź paczkę.'],
['Brak towaru i pomoc','Poradnik PikoBuy podaje, że zakup niedostępnego produktu jest zwracany. W innych sprawach podaj obsłudze numer zamówienia i zdjęcia; zwroty, terminy i koszty zależą od sytuacji.'],
['Szczegóły produktu i zdjęcia QC','Otwórz stronę produktu i użyj przycisku zakupu, jeśli dostępny jest poprawny link. Zdjęcia QC są widoczne tylko, gdy udostępnia je źródło; przed zamówieniem sprawdź cenę, stan i opcje.']
],
sv:[
['PikoBuy Spreadsheet: hitta produkter','Bläddra bland kategorier eller sök på namn och öppna produkten. Exporten från 19 oktober 2026 är en ögonblicksbild: kontrollera pris, lager och variant i den aktuella annonsen.'],
['Så beställer du med PikoBuy','Hitta en vara på Weidian, Taobao eller 1688 och skicka länken till PikoBuy. Välj variant och antal, betala köpet och ordna den internationella frakten separat senare.'],
['Välja storlek och variant','Jämför måttabellen med ett plagg som passar. Kontrollera färg, antal och alternativ och spara uppgifterna för jämförelse med lagerbilderna.'],
['PikoBuy kvalitetskontroll och bilder','Enligt PikoBuys guide kontrolleras och fotograferas mottagna varor. Jämför färg, sömmar, stängningar och skador; be om mått eller en annan vinkel vid behov. Bilder bevisar inte äkthet eller hållbarhet.'],
['Förstå PikoBuys kostnader','Räkna med varans pris, eventuell inrikes frakt, tillämpliga avgifter, internationell frakt och möjliga skatter. Köpet och den internationella frakten betalas separat; kontrollera aktuella belopp.'],
['Beräkna internationell frakt','PikoBuys kalkylator använder destination, produkttyp, vikt och paketmått. Resultatet är en uppskattning; kontrollera slutpris och villkor före betalning.'],
['Välja fraktrutt','Jämför tillgängliga rutter efter destination, tillåtna produkter, prisberäkning, leveranstid och begränsningar. Kontrollera särskilt för elektronik att rutten tillåter alla varor.'],
['Förbereda och spåra paket','Granska lagerbilderna och välj lämplig förpackning. PikoBuy nämner önskemål om minimal eller förstärkt förpackning; kontrollera tillgång och pris och följ paketet efter avsändning.'],
['Slut i lager och hjälp','PikoBuys guide säger att ett köp av en slutsåld vara återbetalas. Kontakta support med ordernummer och bilder vid andra problem; returer, tidsfrister och kostnader beror på situationen.'],
['Använda produktdetaljer och QC','Öppna produktsidan och använd köpknappen när en giltig länk finns. QC-bilder visas bara när källan tillhandahåller dem; kontrollera pris, lager och alternativ innan du beställer.']
]
};
data.en.forEach((entry,i)=>{ const sentences=expandedEnglish[i].match(/[^.!?]+[.!?]+(?:\s|$)/g) || [expandedEnglish[i]]; let selected=[]; for (const sentence of sentences) { if ((selected.join(' ')+' '+sentence).trim().split(/\s+/).length>175) break; selected.push(sentence.trim()); } entry[1]=selected.join(' '); });
data.de.forEach((entry,i)=>{entry[1]=articlesDe[i]});
data.fr.forEach((entry,i)=>{entry[1]=articlesFr[i]});
data.es.forEach((entry,i)=>{entry[1]=articlesEs[i]});
data.it.forEach((entry,i)=>{entry[1]=articlesIt[i]});
data.pt.forEach((entry,i)=>{entry[1]=articlesPt[i]});
data.nl.forEach((entry,i)=>{entry[1]=articlesNl[i]});
data.pl.forEach((entry,i)=>{entry[1]=articlesPl[i]});
data.sv.forEach((entry,i)=>{entry[1]=articlesSv[i]});
export const guides = data;
const questions={
en:['What is this PikoBuy spreadsheet?','How do I place an order?','How should I choose a size?','What do QC photos show?','What costs should I budget for?','How can I estimate shipping?','Can all products use the same shipping route?','How do I prepare and track a parcel?','What if an item is out of stock or has a problem?','Why is a purchase link or QC photo missing?'],
de:['Was ist dieses PikoBuy Spreadsheet?','Wie bestelle ich?','Wie wähle ich die Größe?','Was zeigen QC-Fotos?','Welche Kosten sollte ich einplanen?','Wie schätze ich die Versandkosten?','Können alle Produkte dieselbe Route nutzen?','Wie bereite und verfolge ich ein Paket?','Was passiert bei fehlendem Bestand oder Problemen?','Warum fehlen Kauflink oder QC-Foto?'],
fr:['Qu’est-ce que ce PikoBuy spreadsheet ?','Comment passer commande ?','Comment choisir ma taille ?','Que montrent les photos QC ?','Quels frais prévoir ?','Comment estimer la livraison ?','Tous les produits peuvent-ils prendre la même ligne ?','Comment préparer et suivre un colis ?','Que faire en cas de rupture ou de problème ?','Pourquoi un lien d’achat ou une photo QC manque-t-il ?'],
es:['¿Qué es este PikoBuy spreadsheet?','¿Cómo hago un pedido?','¿Cómo elijo la talla?','¿Qué muestran las fotos QC?','¿Qué gastos debo tener en cuenta?','¿Cómo calculo el envío?','¿Todos los productos pueden usar la misma ruta?','¿Cómo preparo y sigo un paquete?','¿Qué hago si no hay stock o hay un problema?','¿Por qué falta un enlace de compra o una foto QC?'],
it:['Che cos’è questo PikoBuy spreadsheet?','Come effettuo un ordine?','Come scelgo la taglia?','Cosa mostrano le foto QC?','Quali costi devo considerare?','Come stimo la spedizione?','Tutti i prodotti possono usare la stessa linea?','Come preparo e traccio il pacco?','Cosa faccio se un articolo è esaurito o ha problemi?','Perché manca un link di acquisto o una foto QC?'],
pt:['O que é este PikoBuy spreadsheet?','Como faço um pedido?','Como escolho o tamanho?','O que mostram as fotos QC?','Quais custos devo considerar?','Como estimo o envio?','Todos os produtos podem usar a mesma rota?','Como preparo e rastreio o pacote?','O que fazer se o item esgotar ou houver problema?','Por que falta um link de compra ou foto QC?'],
nl:['Wat is deze PikoBuy spreadsheet?','Hoe plaats ik een bestelling?','Hoe kies ik een maat?','Wat laten QC-foto’s zien?','Welke kosten moet ik begroten?','Hoe schat ik de verzendkosten?','Kunnen alle producten via dezelfde route?','Hoe bereid en volg ik een pakket?','Wat bij uitverkochte artikelen of problemen?','Waarom ontbreekt een kooplink of QC-foto?'],
pl:['Czym jest ten PikoBuy spreadsheet?','Jak złożyć zamówienie?','Jak wybrać rozmiar?','Co pokazują zdjęcia QC?','Jakie koszty uwzględnić?','Jak oszacować wysyłkę?','Czy wszystkie produkty mogą użyć tej samej linii?','Jak przygotować i śledzić paczkę?','Co zrobić przy braku towaru lub problemie?','Dlaczego brakuje linku zakupu lub zdjęcia QC?'],
sv:['Vad är detta PikoBuy spreadsheet?','Hur gör jag en beställning?','Hur väljer jag storlek?','Vad visar QC-bilder?','Vilka kostnader bör jag räkna med?','Hur uppskattar jag frakten?','Kan alla produkter använda samma rutt?','Hur förbereder och spårar jag ett paket?','Vad händer vid slutsåld vara eller problem?','Varför saknas en köplänk eller QC-bild?']};
const englishAnswers=[
'This is an independent product discovery and shopping guide, not the official PikoBuy website. The catalog is a FindSpreadsheet export from October 19, 2026. Use categories or search to find records, then check the current listing before ordering; a displayed entry does not guarantee stock.',
'Open a product and follow its purchase button when available, or submit the original marketplace link to PikoBuy. Confirm the seller, item, colour, size and quantity, and check the total before paying. PikoBuy sends the purchased item to its warehouse; international shipping is arranged separately after arrival.',
'Check the seller’s size chart in centimetres and compare it with an item that fits you. Sizes may differ between sellers, so do not rely on a familiar label alone. Save your selected size and ask for a warehouse measurement if an important dimension is unclear and the service is available.',
'PikoBuy describes photographing and checking items after arrival at its warehouse. Review each available view for colour, quantity, stitching, closures and obvious damage, then compare it with the listing. A photo only shows what is visible and cannot establish authenticity, material composition or long-term durability.',
'Budget for the item, any seller-to-warehouse delivery fee, applicable service or payment charges, international shipping and possible customs duties or taxes. The export uses estimated USD prices that may be outdated. Check both the current purchase total and the final shipping quote; fees depend on the order and destination.',
'Use PikoBuy’s shipping estimate with your destination, product type, estimated weight and parcel length, width and height. Compare eligible routes and their conditions. Packing can change weight or dimensions, so an estimate is not a final charge; review the actual parcel quote before paying.',
'No single route is guaranteed to accept every item. Availability can vary with destination, parcel size and product restrictions. Check the latest route rules for electronics, batteries or other restricted goods and ask PikoBuy support if you are unsure before submitting the parcel.',
'After warehouse arrival, review available QC images and decide whether the contents and packaging are suitable. PikoBuy mentions requests such as minimal or reinforced packaging; confirm the current options and costs. After dispatch, check the order’s tracking information and allow time for scans to appear.',
'PikoBuy’s published guide says an out-of-stock purchase is refunded. For damage, a wrong variant or other issues, contact PikoBuy support with the order number, clear photos and a description before shipping internationally. Ask about the applicable seller’s return terms, deadlines, fees and refund process; these can vary.',
'This catalog comes from an export, and some records do not contain a valid purchase ID. Such records cannot have a reliable direct purchase link. QC images are displayed only if available from the source; their absence does not mean an inspection occurred or did not occur. Check the live listing and your PikoBuy order for current information.'
];
export const faqs=Object.fromEntries(Object.keys(data).map(lang=>[lang,questions[lang].map((question,i)=>[question,lang==='en'?englishAnswers[i]:localizedFaqAnswers[lang][i]])]));
