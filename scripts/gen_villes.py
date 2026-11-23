#!/usr/bin/env python3
"""Génère les pages villes de clermont-nuisibles.fr (src/zones-intervention/...)."""
import json, re, sys, html
from pathlib import Path

SRC = Path(sys.argv[1])
BASE = "https://clermont-nuisibles.fr"
TPL = (SRC / "guepes/index.html").read_text()

PESTS = {
    "rats": ("/deratisation/rats/", "Rats"),
    "souris": ("/deratisation/souris/", "Souris"),
    "taupes": ("/taupes/", "Taupes"),
    "pigeons": ("/depigeonnage/", "Pigeons"),
    "punaises": ("/punaises-de-lit/", "Punaises de lit"),
    "cafards": ("/cafards/", "Cafards"),
    "puces": ("/puces/", "Puces"),
    "fourmis": ("/fourmis/", "Fourmis"),
    "guepes": ("/guepes/", "Guêpes"),
    "frelons": ("/frelons-asiatiques/", "Frelons asiatiques"),
    "moustiques": ("/moustiques/", "Moustiques"),
    "mites": ("/mites/", "Mites"),
    "mouches": ("/mouches/", "Mouches"),
    "desinfection": ("/desinfection/", "Désinfection"),
}

E = html.escape

# Chaque ville : contenu propre. Aucune intervention inventée.
VILLES = [
 dict(slug="clermont-ferrand", nom="Clermont-Ferrand", cp="63000", de="à",
  lead="Rats dans une cave du centre ancien, punaises de lit dans un appartement, cafards dans une cuisine de restaurant : j'interviens dans tous les quartiers de Clermont-Ferrand, dans la journée.",
  contexte=["Clermont-Ferrand concentre tout ce qui attire les nuisibles : des immeubles anciens en pierre de Volvic avec caves et vides sanitaires, beaucoup de logements étudiants qui changent souvent de locataires, et une forte densité de commerces de bouche.",
            "J'interviens aussi bien dans le centre historique et autour de Jaude que dans le vieux Montferrand, à Saint-Jacques, aux Salins, à La Pardieu, à la Croix-de-Neyrat ou aux Vergnes."],
  pests=[("rats","caves, cours intérieures et réseaux d'égout des immeubles anciens"),
         ("punaises","appartements et colocations, souvent ramenées après un voyage ou un déménagement"),
         ("cafards","cuisines d'immeubles et restaurants, ils circulent par les gaines et colonnes"),
         ("souris","faux plafonds, doublages et caves dès les premiers froids"),
         ("pigeons","balcons, corniches et rebords de fenêtres en centre-ville"),
         ("frelons","arbres des parcs et jardins, sous les toits en fin d'été")],
  delai="J'interviens dans la journée partout dans Clermont-Ferrand. Pour un restaurant ou un commerce, je peux passer en dehors des heures d'ouverture.",
  voisins=["chamalieres","aubiere","beaumont","romagnat","gerzat"],
  faq=[("Intervenez-vous dans les immeubles et copropriétés à Clermont-Ferrand ?","Oui. Pour les parties communes (caves, locaux poubelles, colonnes), je travaille avec le syndic ou le conseil syndical, et je traite aussi les appartements individuellement."),
       ("Qui paie la dératisation dans un immeuble à Clermont-Ferrand ?","Les parties communes relèvent en général de la copropriété, le logement de l'occupant. Pour un bail, cela dépend de l'origine du problème et du moment où il apparaît : je vous remets une facture et un rapport utiles dans les deux cas.")]),
 dict(slug="chamalieres", nom="Chamalières", cp="63400", de="à",
  lead="Maisons anciennes, villas avec jardin et immeubles résidentiels : j'interviens à Chamalières contre tous les nuisibles, dans la journée, sans frais de déplacement.",
  contexte=["Collée à Clermont-Ferrand, Chamalières mélange immeubles résidentiels et grandes maisons anciennes avec jardins arborés. Les toitures et combles de ces maisons sont des endroits recherchés par les guêpes et les frelons, et les vieux murs laissent facilement passer les souris.",
            "Le passage de la Tiretaine et la proximité de Royat ajoutent de l'humidité dans certains secteurs, ce qui favorise aussi les rongeurs."],
  pests=[("souris","murs anciens, combles et doublages dès l'automne"),
         ("guepes","toitures, coffres de volets roulants et cabanons de jardin"),
         ("frelons","grands arbres des jardins et des parcs"),
         ("rats","caves et abords des cours d'eau"),
         ("punaises","appartements et logements loués"),
         ("mites","maisons anciennes, placards et textiles")],
  delai="Chamalières est à quelques minutes de Clermont-Ferrand : j'interviens dans la journée.",
  voisins=["clermont-ferrand","royat","ceyrat","beaumont"],
  faq=[("Combien coûte la destruction d'un nid de guêpes à Chamalières ?","À partir de 80 €, selon l'accès et la hauteur du nid. Le devis et le déplacement sont gratuits."),
       ("Pouvez-vous intervenir dans une maison ancienne sans abîmer les boiseries ?","Oui. Je choisis la méthode et les produits selon les matériaux, et je vous explique avant de commencer ce que je vais faire.")]),
 dict(slug="royat", nom="Royat", cp="63130", de="à",
  lead="Maisons de la vallée, résidences et hébergements touristiques : j'interviens à Royat contre les rongeurs, les insectes et les nids de guêpes ou de frelons, dans la journée.",
  contexte=["Station thermale au pied de la chaîne des Puys, Royat compte beaucoup d'hébergements pour les curistes et les touristes. C'est exactement le type de lieu où les punaises de lit arrivent dans les valises.",
            "La vallée de la Tiretaine, les jardins en pente et les bois autour de la commune attirent aussi rongeurs, guêpes et frelons asiatiques."],
  pests=[("punaises","hôtels, meublés et locations saisonnières"),
         ("souris","maisons en bordure de bois et de jardins"),
         ("rats","abords de la Tiretaine et caves"),
         ("guepes","toitures, murets et talus"),
         ("frelons","arbres et haies, souvent repérés tard dans la saison"),
         ("desinfection","hébergements entre deux occupations")],
  delai="Royat est tout proche de Clermont-Ferrand : j'interviens dans la journée, y compris pour les hébergements qui doivent accueillir de nouveaux clients rapidement.",
  voisins=["chamalieres","ceyrat","clermont-ferrand"],
  faq=[("Je loue un meublé à Royat, que faire en cas de punaises de lit ?","Appelez-moi avant le prochain séjour. Je confirme l'infestation, je traite et je vous indique quand la location peut reprendre. Je vous remets une facture et un rapport."),
       ("Intervenez-vous pour les hôtels et résidences de tourisme ?","Oui, avec un traitement chambre par chambre si besoin, et un suivi pour vérifier que le problème ne revient pas.")]),
 dict(slug="aubiere", nom="Aubière", cp="63170", de="à",
  lead="Logements étudiants près des Cézeaux, maisons du vieux bourg avec caves, commerces : j'interviens à Aubière contre tous les nuisibles, dans la journée.",
  contexte=["Aubière accueille le campus universitaire des Cézeaux et de nombreux logements étudiants. Avec les changements de locataires fréquents, les punaises de lit et les cafards s'installent facilement.",
            "Le vieux bourg, avec ses maisons vigneronnes et leurs caves, est un terrain favorable pour les rats et les souris, tandis que les zones commerciales demandent un suivi régulier."],
  pests=[("punaises","studios et résidences étudiantes"),
         ("cafards","cuisines d'immeubles et commerces alimentaires"),
         ("rats","anciennes caves du bourg"),
         ("souris","maisons et garages"),
         ("frelons","jardins et arbres en périphérie"),
         ("fourmis","maisons avec jardin au printemps")],
  delai="Aubière est à quelques minutes de Clermont-Ferrand : j'interviens dans la journée.",
  voisins=["clermont-ferrand","beaumont","romagnat","cournon-d-auvergne"],
  faq=[("Je suis étudiant à Aubière et j'ai des punaises de lit, que faire ?","Prévenez votre propriétaire ou votre résidence et appelez-moi. Ne déplacez pas vos affaires dans un autre logement, vous risqueriez de les emporter avec vous."),
       ("Traitez-vous les commerces de la zone commerciale ?","Oui, avec des contrats de suivi pour les professionnels et un registre à présenter en cas de contrôle.")]),
 dict(slug="beaumont", nom="Beaumont", cp="63110", de="à",
  lead="Appartements, pavillons et commerces : j'interviens à Beaumont contre les rats, les souris, les insectes et les nids de guêpes, dans la journée.",
  contexte=["Commune résidentielle dans le prolongement direct de Clermont-Ferrand, Beaumont compte à la fois des immeubles et beaucoup de pavillons avec jardin.",
            "Dans les immeubles, ce sont surtout les cafards et les punaises de lit qui posent problème. Dans les pavillons, ce sont les rongeurs à l'automne et les nids de guêpes ou de frelons à la belle saison."],
  pests=[("souris","garages, sous-sols et combles"),
         ("rats","jardins, composteurs et abris"),
         ("cafards","cuisines et parties communes d'immeubles"),
         ("punaises","appartements"),
         ("guepes","toitures et volets roulants"),
         ("fourmis","terrasses et cuisines au printemps")],
  delai="Beaumont est collée à Clermont-Ferrand : j'interviens dans la journée.",
  voisins=["clermont-ferrand","aubiere","romagnat","ceyrat","chamalieres"],
  faq=[("Le déplacement est-il facturé à Beaumont ?","Non, le déplacement et le devis sont gratuits."),
       ("Pouvez-vous traiter un pavillon entier contre les souris ?","Oui. Je repère les points d'entrée, je pose des postes d'appâtage sécurisés et je vous conseille pour boucher les accès.")]),
 dict(slug="romagnat", nom="Romagnat", cp="63540", de="à",
  lead="Romagnat, c'est chez moi : mon entreprise y est domiciliée. J'interviens au bourg, à Opme et à Saulzet-le-Chaud, souvent très rapidement.",
  contexte=["Au pied du plateau de Gergovie, Romagnat compte beaucoup de maisons avec grand jardin, des haies, des arbres fruitiers et des terrains en bordure de champs. C'est un cadre idéal pour les frelons asiatiques, les guêpes et les taupes.",
            "À l'automne, les souris et les mulots quittent les champs et cherchent à entrer dans les maisons et les garages."],
  pests=[("frelons","arbres fruitiers, haies et grands arbres"),
         ("guepes","toitures, murets et cabanons"),
         ("taupes","pelouses et potagers"),
         ("souris","maisons en bordure de champs, dès les premiers froids"),
         ("rats","poulaillers, composteurs et abris de jardin"),
         ("fourmis","terrasses et maisons au printemps")],
  delai="Romagnat est ma commune : c'est là que je peux intervenir le plus vite.",
  voisins=["clermont-ferrand","aubiere","beaumont","ceyrat","le-cendre"],
  faq=[("Intervenez-vous à Opme et Saulzet-le-Chaud ?","Oui, sur toute la commune de Romagnat, avec le même tarif et sans frais de déplacement."),
       ("Faut-il détruire un nid de frelons asiatiques en hiver ?","Ça dépend. Un nid peut rester actif tard en saison quand il fait doux. Envoyez-moi une photo : je vous dis s'il faut intervenir ou non.")]),
 dict(slug="ceyrat", nom="Ceyrat", cp="63122", de="à",
  lead="Maisons en lisière de forêt, jardins et hameaux : j'interviens à Ceyrat et à Boisséjour contre les frelons, les guêpes, les rongeurs et les taupes.",
  contexte=["Ceyrat est adossée aux premières pentes de la chaîne des Puys, avec beaucoup de maisons entourées de bois et de grands jardins.",
            "Cet environnement attire les frelons asiatiques et les guêpes, et les rongeurs qui vivent en lisière de forêt cherchent à entrer dans les maisons dès que les températures baissent."],
  pests=[("frelons","grands arbres et lisières de bois"),
         ("guepes","toitures, chalets et abris de jardin"),
         ("souris","maisons isolées et garages"),
         ("taupes","pelouses et terrains"),
         ("rats","abords des habitations et poulaillers"),
         ("mites","maisons secondaires peu occupées")],
  delai="Ceyrat est à une quinzaine de minutes de Clermont-Ferrand : j'interviens dans la journée.",
  voisins=["romagnat","royat","chamalieres","beaumont"],
  faq=[("Intervenez-vous pour un nid de frelons très haut dans un arbre ?","Oui, avec du matériel adapté aux nids en hauteur. Décrivez-moi l'emplacement ou envoyez une photo pour un devis précis."),
       ("Les taupes reviennent chaque année, que faire ?","Je pratique le piégeage, sans produit chimique, et je vous explique comment limiter leur retour.")]),
 dict(slug="cournon-d-auvergne", nom="Cournon-d'Auvergne", cp="63800", de="à",
  lead="Appartements, quartiers pavillonnaires, commerces et entreprises : j'interviens à Cournon-d'Auvergne contre tous les nuisibles, dans la journée.",
  contexte=["Cournon-d'Auvergne s'étend jusqu'aux bords de l'Allier, avec son plan d'eau, de nombreux quartiers pavillonnaires, des immeubles et de grandes zones d'activités.",
            "La proximité de la rivière favorise les moustiques et les rats, et les entreprises comme les commerces alimentaires ont besoin d'un suivi régulier contre les rongeurs et les insectes."],
  pests=[("rats","abords de l'Allier, jardins et locaux poubelles"),
         ("moustiques","jardins proches de l'eau en été"),
         ("souris","pavillons et entrepôts"),
         ("cafards","immeubles et commerces alimentaires"),
         ("guepes","toitures et volets roulants"),
         ("frelons","arbres des jardins")],
  delai="Cournon-d'Auvergne est à une quinzaine de minutes : j'interviens dans la journée.",
  voisins=["le-cendre","pont-du-chateau","lempdes","aubiere"],
  faq=[("Proposez-vous des contrats pour les entreprises à Cournon ?","Oui, avec des passages réguliers, des postes d'appâtage numérotés et un registre pour vos contrôles d'hygiène."),
       ("Que faire contre les moustiques près de l'Allier ?","Commencez par vider toutes les eaux stagnantes (soucoupes, gouttières, récupérateurs). Si ça ne suffit pas, je traite les zones de repos des moustiques dans le jardin.")]),
 dict(slug="le-cendre", nom="Le Cendre", cp="63670", de="au",
  lead="Pavillons, jardins et commerces : j'interviens au Cendre contre les rongeurs, les insectes et les nids de guêpes ou de frelons.",
  contexte=["Le Cendre est une commune résidentielle au sud de l'agglomération, entre la voie ferrée et l'Allier, avec beaucoup de maisons individuelles et de jardins.",
            "Les rongeurs profitent des jardins et des abords de la rivière, et les nids de guêpes et de frelons sont fréquents dans les toitures et les haies."],
  pests=[("souris","maisons et garages à l'automne"),
         ("rats","jardins, composteurs et abords de l'Allier"),
         ("guepes","toitures et cabanons"),
         ("frelons","haies et arbres"),
         ("moustiques","jardins proches de l'eau"),
         ("taupes","pelouses")],
  delai="Le Cendre est à une vingtaine de minutes : j'interviens dans la journée.",
  voisins=["cournon-d-auvergne","romagnat","aubiere","issoire"],
  faq=[("Le déplacement est-il gratuit au Cendre ?","Oui, comme partout dans le Puy-de-Dôme."),
       ("Faut-il être présent pendant l'intervention ?","Pour un nid à l'extérieur, pas forcément si j'ai accès. Pour un traitement à l'intérieur, oui, au moins au début pour faire le point.")]),
 dict(slug="gerzat", nom="Gerzat", cp="63360", de="à",
  lead="Maisons, entreprises et exploitations : j'interviens à Gerzat contre les rats, les souris, les insectes et les nids de guêpes, dans la journée.",
  contexte=["Au nord de Clermont-Ferrand, Gerzat est entourée par les terres agricoles de la Limagne et accueille plusieurs zones d'activités.",
            "Après les récoltes et à l'arrivée du froid, les souris et les rats quittent les champs et entrent dans les maisons, les garages et les bâtiments d'entreprise."],
  pests=[("souris","maisons et bâtiments en bordure de champs"),
         ("rats","entrepôts, bâtiments agricoles et abords"),
         ("guepes","toitures et bardages"),
         ("frelons","arbres et haies"),
         ("pigeons","bâtiments d'activité et hangars"),
         ("mouches","locaux professionnels en été")],
  delai="Gerzat est à une quinzaine de minutes : j'interviens dans la journée.",
  voisins=["clermont-ferrand","lempdes","riom","pont-du-chateau"],
  faq=[("Intervenez-vous dans les entrepôts et bâtiments agricoles ?","Oui. Je mets en place des postes d'appâtage sécurisés et un suivi adapté à la taille du site."),
       ("Les souris reviennent chaque hiver, est-ce normal ?","C'est fréquent près des champs. Le traitement règle l'infestation, mais il faut aussi boucher les points d'entrée : je vous montre lesquels.")]),
 dict(slug="lempdes", nom="Lempdes", cp="63370", de="à",
  lead="Maisons, immeubles, commerces et entreprises : j'interviens à Lempdes contre tous les nuisibles, dans la journée.",
  contexte=["À l'est de Clermont-Ferrand, près de l'aéroport, Lempdes mêle quartiers résidentiels, commerces et zones d'activités.",
            "Les professionnels de la restauration et de l'alimentaire ont besoin d'un suivi régulier, et les particuliers sont surtout concernés par les rongeurs et les nids de guêpes."],
  pests=[("souris","maisons, sous-sols et garages"),
         ("rats","locaux poubelles et abords des commerces"),
         ("cafards","cuisines professionnelles et immeubles"),
         ("guepes","toitures et volets roulants"),
         ("frelons","arbres des jardins"),
         ("fourmis","maisons au printemps")],
  delai="Lempdes est à une quinzaine de minutes : j'interviens dans la journée.",
  voisins=["pont-du-chateau","gerzat","cournon-d-auvergne","clermont-ferrand"],
  faq=[("Avez-vous une offre pour les restaurants à Lempdes ?","Oui, avec des passages réguliers et un registre de traitement à présenter lors des contrôles sanitaires."),
       ("Intervenez-vous le week-end ?","Oui, je suis joignable 24h/24 et 7j/7. On fixe l'heure ensemble.")]),
 dict(slug="pont-du-chateau", nom="Pont-du-Château", cp="63430", de="à",
  lead="Vieux bourg, maisons avec jardin et bords de l'Allier : j'interviens à Pont-du-Château contre les rongeurs, les moustiques et les nids de guêpes ou de frelons.",
  contexte=["Pont-du-Château s'est construite au bord de l'Allier. Son vieux bourg compte des maisons anciennes avec caves, et les quartiers plus récents beaucoup de pavillons avec jardin.",
            "La rivière et les zones humides favorisent les rats et les moustiques, et les maisons anciennes laissent facilement entrer les souris."],
  pests=[("rats","bords de l'Allier, caves et jardins"),
         ("moustiques","jardins proches de la rivière"),
         ("souris","maisons anciennes et garages"),
         ("guepes","toitures et murs en pierre"),
         ("frelons","arbres en bord de rivière et jardins"),
         ("taupes","pelouses")],
  delai="Pont-du-Château est à une vingtaine de minutes : j'interviens dans la journée.",
  voisins=["lempdes","cournon-d-auvergne","gerzat","clermont-ferrand"],
  faq=[("J'ai des rats dans mon jardin près de l'Allier, que faire ?","Ne laissez pas de nourriture accessible (composteur ouvert, gamelles, graines). Je pose des postes d'appâtage sécurisés, hors de portée des enfants et des animaux."),
       ("Le devis est-il gratuit à Pont-du-Château ?","Oui, le devis et le déplacement sont gratuits.")]),
 dict(slug="riom", nom="Riom", cp="63200", de="à",
  lead="Centre historique, maisons anciennes, commerces : j'interviens à Riom contre les rats, les pigeons, les insectes et les nids de guêpes ou de frelons.",
  contexte=["Riom, sous-préfecture au nord de Clermont-Ferrand, a un centre historique en pierre de Volvic avec des immeubles anciens, des cours intérieures et des caves.",
            "Ce bâti ancien attire les rats et les souris, et les corniches et façades du centre accueillent souvent des pigeons. Autour de la ville, les maisons avec jardin sont concernées par les guêpes, les frelons et les taupes."],
  pests=[("rats","caves et cours du centre ancien"),
         ("pigeons","façades, corniches et greniers"),
         ("souris","immeubles anciens et maisons"),
         ("punaises","appartements et logements loués"),
         ("guepes","toitures et volets"),
         ("frelons","jardins et arbres")],
  delai="Riom est à environ 20 minutes de Clermont-Ferrand. J'interviens dans la journée, en fonction de mon planning.",
  voisins=["gerzat","clermont-ferrand","lempdes"],
  faq=[("Le déplacement est-il facturé jusqu'à Riom ?","Non, le déplacement est gratuit dans tout le Puy-de-Dôme."),
       ("Pouvez-vous éloigner les pigeons d'une façade à Riom ?","Oui, avec des systèmes anti-pigeons adaptés à la façade (pics, filets, fils tendus), posés sans abîmer le bâti.")]),
 dict(slug="issoire", nom="Issoire", cp="63500", de="à",
  lead="Maisons, appartements, commerces et entreprises : j'interviens à Issoire et dans les environs contre tous les nuisibles.",
  contexte=["Issoire, au sud du département, a un centre ancien autour de l'abbatiale Saint-Austremoine, des quartiers pavillonnaires et une importante activité industrielle.",
            "Les maisons anciennes et les bords de l'Allier attirent les rongeurs, et les sites professionnels ont besoin d'un suivi régulier."],
  pests=[("rats","caves, jardins et abords de l'Allier"),
         ("souris","maisons et garages à l'automne"),
         ("pigeons","façades et bâtiments industriels"),
         ("guepes","toitures et volets"),
         ("frelons","jardins et arbres"),
         ("cafards","immeubles et commerces alimentaires")],
  delai="Issoire est à environ 35 minutes de Clermont-Ferrand. J'interviens dans la journée ou le lendemain selon mon planning, et je vous donne une heure précise au téléphone.",
  voisins=["le-cendre","cournon-d-auvergne"],
  faq=[("Vous déplacez-vous vraiment jusqu'à Issoire ?","Oui, le déplacement est gratuit dans tout le Puy-de-Dôme. Appelez-moi pour qu'on fixe un créneau."),
       ("Proposez-vous des contrats pour les entreprises d'Issoire ?","Oui, avec des passages réguliers et un registre de traitement.")]),
 dict(slug="thiers", nom="Thiers", cp="63300", de="à",
  lead="Vieille ville, maisons anciennes et ateliers : j'interviens à Thiers et dans les environs contre tous les nuisibles.",
  contexte=["Thiers, la capitale de la coutellerie, est construite à flanc de colline au-dessus de la vallée de la Durolle. Sa vieille ville compte beaucoup de maisons anciennes et serrées, avec caves et greniers.",
            "Ce bâti ancien favorise les rats, les souris et les pigeons, et les maisons en périphérie sont concernées par les guêpes et les frelons asiatiques."],
  pests=[("rats","caves et ruelles de la vieille ville"),
         ("souris","maisons anciennes et greniers"),
         ("pigeons","toitures et greniers"),
         ("guepes","toitures et murs"),
         ("frelons","jardins et arbres"),
         ("punaises","appartements et logements loués")],
  delai="Thiers est à environ 45 minutes de Clermont-Ferrand. J'interviens dans la journée ou le lendemain selon mon planning, et je vous donne une heure précise au téléphone.",
  voisins=["pont-du-chateau","lempdes"],
  faq=[("Le déplacement est-il gratuit jusqu'à Thiers ?","Oui, comme partout dans le Puy-de-Dôme."),
       ("Intervenez-vous dans les maisons de la vieille ville, difficiles d'accès ?","Oui, avec le matériel adapté. Décrivez-moi l'accès au téléphone pour que je prévoie ce qu'il faut.")]),
]
BY = {v["slug"]: v for v in VILLES}
SVG_TEL = re.search(r'<svg viewBox="0 0 24 24"[^>]*><path d="M22 16.9[^"]*"/></svg>', TPL).group(0)

head_start = TPL[:TPL.find("<title>")]
body_head = TPL[TPL.find("</head>"):TPL.find("<main>") + len("<main>")]
body_head = body_head.replace(' aria-current="page"', '')
footer = TPL[TPL.find("</main>"):]
band = re.search(r'<section class="s" style="padding-top:20px">.*?</section>', TPL, re.S).group(0)
biz_ld = re.search(r'<script type="application/ld\+json">(\{"@context": "https://schema.org", "@type": "LocalBusiness".*?)</script>', TPL, re.S).group(1)

def page(title, desc, url, ld, main):
    lds = "".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)
    h = (f'{head_start}<title>{E(title)}</title>\n<meta name="description" content="{E(desc)}">\n'
         f'<meta name="robots" content="index, follow, max-image-preview:large">\n<link rel="canonical" href="{url}">\n'
         f'<meta name="theme-color" content="#B5121B">\n<meta property="og:type" content="website"><meta property="og:locale" content="fr_FR"><meta property="og:site_name" content="Clermont Nuisibles">\n'
         f'<meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}"><meta property="og:url" content="{url}">\n'
         f'<meta property="og:image" content="{BASE}/images/og.jpg"><meta name="twitter:card" content="summary_large_image">\n'
         '<link rel="icon" href="/favicon.png" type="image/png" sizes="192x192"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/images/apple-touch-icon.png">\n'
         f'<link rel="stylesheet" href="/style.css">\n<script type="application/ld+json">{biz_ld}</script>{lds}\n')
    return h + body_head + "\n" + main + "\n" + band + "\n" + footer

def crumbs_ld(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": BASE + u} for i, (n, u) in enumerate(items)]}

def side(nom):
    return (f'<aside class="side"><p class="from">{E(nom)}</p><p class="from">Déplacement</p><p class="big">Gratuit</p>\n'
            f'<a class="btn btn-red" href="tel:+33766502938">{SVG_TEL}Appeler</a><a class="btn btn-line" style="color:var(--ink)" href="/contact/">Demander un devis</a>\n'
            '<ul><li>Intervention dans la journée</li><li>Joignable 24h/24, 7j/7</li><li>Devis gratuit</li><li>Garantie selon l\'infestation</li><li>Certifié Certibiocide</li><li>+1 500 interventions dans le 63</li></ul></aside>')

HUB = "/zones-intervention/"
out = SRC / "zones-intervention"
for v in VILLES:
    nom, url = v["nom"], f'{HUB}{v["slug"]}/'
    loc = "au Cendre" if v["slug"]=="le-cendre" else f"à {nom}"
    pres = "du Cendre" if v["slug"]=="le-cendre" else ("d'"+nom if nom[0] in "AEIOUÉ" else "de "+nom)
    title = f'Dératisation et désinsectisation {loc} | Clermont Nuisibles'
    if v["slug"] == "clermont-ferrand":
        title = "Nuisibles à Clermont-Ferrand : intervention dans tous les quartiers"
    desc = f'Rats, souris, punaises de lit, cafards, guêpes, frelons {loc} ({v["cp"]}) : intervention dans la journée par un professionnel certifié. Devis et déplacement gratuits.'
    pests = "".join(f'<li><a href="{PESTS[k][0]}" style="color:var(--red-d)"><b>{PESTS[k][1]}</b></a> : {E(r)}</li>' for k, r in v["pests"])
    vois = "".join(f'<a href="{HUB}{s}/">{E(BY[s]["nom"])}</a>' for s in v["voisins"])
    faqs = "".join(f'<details><summary>{E(q)}</summary><div><p>{E(a)}</p></div></details>' for q, a in v["faq"])
    ctx = "".join(f'<p>{E(p)}</p>' for p in v["contexte"])
    main = f'''
<section class="phero"><div class="wrap">
<div class="crumbs"><a href="/">Accueil</a> › <a href="{HUB}">Zones d'intervention</a> › {E(nom)}</div>
<span class="chip">{E(nom)} · {v["cp"]}</span>
<h1>Dératisation et traitement des nuisibles {E(loc)}</h1><p class="lead">{E(v["lead"])}</p>
<div class="cta-row"><a class="btn btn-red" href="tel:+33766502938">{SVG_TEL}Appeler 07 66 50 29 38</a><a class="btn btn-line" href="/contact/">Devis gratuit</a></div>
<p class="phero-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Déplacement gratuit {E(loc)} · Intervention dans la journée</p>
</div></section>
<div class="wrap"><div class="art"><article>
<h2>Les nuisibles fréquents {E(loc)}</h2><ul>{pests}</ul>
<h2>Ce qui attire les nuisibles {E(loc)}</h2>{ctx}
<div class="callout"><p><b>Un doute sur le nuisible ?</b> Envoyez-moi une photo via le <a href="/contact/" style="color:var(--red-d)">formulaire</a> ou appelez-moi : je vous dis ce que c'est et combien ça coûte.</p></div>
<h2>Délai d'intervention</h2><p>{E(v["delai"])} Je suis joignable 24h/24, 7j/7, et c'est moi qui viens : pas de sous-traitance.</p>
<h2>Comment se passe l'intervention</h2><ol class="num"><li><b>Diagnostic</b>J'identifie le nuisible, l'ampleur du problème et son origine.</li><li><b>Devis</b>Je vous annonce le prix avant de commencer.</li><li><b>Traitement</b>Avec des produits biocides homologués, adaptés au lieu et aux personnes présentes.</li><li><b>Conseils et suivi</b>Je vous explique comment éviter le retour du problème, et je vous remets un rapport.</li></ol>
<h2>Tarifs {E(loc)}</h2><p>Les mêmes qu'à Clermont-Ferrand, sans frais de déplacement : à partir de 80 € pour un nid de guêpes ou de frelons, 90 € pour une dératisation, 120 € pour les cafards ou les punaises de lit. Le prix final dépend de la surface et de l'ampleur du problème. Voir les <a href="/tarifs/" style="color:var(--red-d)">tarifs détaillés</a>.</p>
<h2>J'interviens aussi près {E(pres)}</h2><div class="zones">{vois}<a href="{HUB}">Toutes les communes</a></div>
<h2>Questions fréquentes</h2>{faqs}
</article>
{side(nom)}
</div></div>'''
    ld = [
        {"@context": "https://schema.org", "@type": "Service", "name": f"Dératisation et désinsectisation {loc}",
         "serviceType": "Lutte contre les nuisibles (dératisation, désinsectisation, désinfection)", "url": BASE + url,
         "provider": {"@id": f"{BASE}/#entreprise"},
         "areaServed": {"@type": "City", "name": nom, "address": {"@type": "PostalAddress", "postalCode": v["cp"], "addressLocality": nom, "addressRegion": "Puy-de-Dôme", "addressCountry": "FR"}}},
        crumbs_ld([("Accueil", "/"), ("Zones d'intervention", HUB), (nom, url)]),
        {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in v["faq"]]},
    ]
    d = out / v["slug"]; d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(page(title, desc, BASE + url, ld, main))

# Page hub
cards = "".join(f'<a class="card" href="{HUB}{v["slug"]}/" style="text-decoration:none;color:inherit"><h3>{E(v["nom"])} <small style="font-weight:500;color:var(--muted,#666)">{v["cp"]}</small></h3><p>{E((lambda L: L[0]+", "+", ".join(x.lower() for x in L[1:]))([PESTS[k][1] for k,_ in v["pests"][:4]]))}…</p><span style="color:var(--red-d);font-weight:600">Voir la page →</span></a>' for v in VILLES)
main = f'''
<section class="phero"><div class="wrap">
<div class="crumbs"><a href="/">Accueil</a> › Zones d'intervention</div>
<h1>Zones d'intervention : Clermont-Ferrand et tout le Puy-de-Dôme</h1><p class="lead">Je me déplace gratuitement chez vous, dans l'agglomération clermontoise et partout dans le Puy-de-Dôme, souvent dans la journée.</p>
<div class="cta-row"><a class="btn btn-red" href="tel:+33766502938">{SVG_TEL}Appeler 07 66 50 29 38</a><a class="btn btn-line" href="/contact/">Devis gratuit</a></div>
</div></section>
<section class="s"><div class="wrap"><div class="head"><span class="eyebrow">Communes principales</span><h2>Choisissez votre commune</h2></div>
<div class="grid g3">{cards}</div>
<p style="margin-top:28px">Votre commune n'est pas dans la liste ? J'interviens dans tout le Puy-de-Dôme, et parfois au-delà. <a href="tel:+33766502938" style="color:var(--red-d)">Appelez-moi</a> pour vérifier.</p>
</div></section>'''
ld = [crumbs_ld([("Accueil", "/"), ("Zones d'intervention", HUB)]),
      {"@context": "https://schema.org", "@type": "ItemList", "itemListElement": [
          {"@type": "ListItem", "position": i + 1, "name": v["nom"], "url": f'{BASE}{HUB}{v["slug"]}/'} for i, v in enumerate(VILLES)]}]
out.mkdir(exist_ok=True)
(out / "index.html").write_text(page("Zones d'intervention dans le Puy-de-Dôme | Clermont Nuisibles",
    "Dératisation et désinsectisation à Clermont-Ferrand, Chamalières, Aubière, Cournon, Riom, Issoire, Thiers et dans tout le Puy-de-Dôme. Déplacement gratuit.",
    BASE + HUB, ld, main))
print(len(VILLES), "villes générées")
