import type { HeroDetail } from "../../type";

import ahmose from "./ahmose.json";
import alonso from "./alonso.json";
import bahiti from "./bahiti.json";
import blanchette from "./blanchette.json";
import bradley from "./bradley.json";
import charlie from "./charlie.json";
import cloris from "./cloris.json";
import edith from "./edith.json";
import eleonora from "./eleonora.json";
import eugene from "./eugene.json";
import flint from "./flint.json";
import flora from "./flora.json";
import fred from "./fred.json";
import freya from "./freya.json";
import gatot from "./gatot.json";
import gina from "./gina.json";
import gisela from "./gisela.json";
import gordon from "./gordon.json";
import greg from "./greg.json";
import gregory from "./gregory.json";
import gwen from "./gwen.json";
import hector from "./hector.json";
import hendrik from "./hendrik.json";
import hervor from "./hervor.json";
import jasser from "./jasser.json";
import jeronimo from "./jeronimo.json";
import jessie from "./jessie.json";
import karol from "./karol.json";
import lloyd from "./Lloyd.json";
import ligeia from "./ligeia.json";
import lingxue from "./lingxue.json";
import logan from "./logan.json";
import lumakbokan from "./lumakbokan.json";
import lynn from "./lynn.json";
import magnus from "./magnus.json";
import mia from "./mia.json";
import molly from "./molly.json";
import natalia from "./natalia.json";
import norah from "./norah.json";
import patrick from "./patrick.json";
import philly from "./philly.json";
import reina from "./reina.json";
import renee from "./renee.json";
import rufus from "./rufus.json";
import seoyoon from "./seoyoon.json";
import sergey from "./sergey.json";
import smith from "./smith.json";
import sonya from "./sonya.json";
import vulcanus from "./vulcanus.json";
import wayne from "./wayne.json";
import wuMing from "./wu_ming.json";
import xura from "./xura.json";
import zinman from "./zinman.json";

function asHeroDetail(value: unknown): HeroDetail {
	return value as HeroDetail;
}

export const HERO_DETAILS: Record<string, HeroDetail> = {
	ahmose: asHeroDetail(ahmose),
	alonso: asHeroDetail(alonso),
	bahiti: asHeroDetail(bahiti),
	blanchette: asHeroDetail(blanchette),
	bradley: asHeroDetail(bradley),
	charlie: asHeroDetail(charlie),
	cloris: asHeroDetail(cloris),
	edith: asHeroDetail(edith),
	eleonora: asHeroDetail(eleonora),
	eugene: asHeroDetail(eugene),
	flint: asHeroDetail(flint),
	flora: asHeroDetail(flora),
	fred: asHeroDetail(fred),
	freya: asHeroDetail(freya),
	gatot: asHeroDetail(gatot),
	gina: asHeroDetail(gina),
	gisela: asHeroDetail(gisela),
	gordon: asHeroDetail(gordon),
	greg: asHeroDetail(greg),
	gregory: asHeroDetail(gregory),
	gwen: asHeroDetail(gwen),
	hector: asHeroDetail(hector),
	hendrik: asHeroDetail(hendrik),
	hervor: asHeroDetail(hervor),
	jasser: asHeroDetail(jasser),
	jeronimo: asHeroDetail(jeronimo),
	jessie: asHeroDetail(jessie),
	karol: asHeroDetail(karol),
	ligeia: asHeroDetail(ligeia),
	lingxue: asHeroDetail(lingxue),
	lloyd: asHeroDetail(lloyd),
	logan: asHeroDetail(logan),
	lumakbokan: asHeroDetail(lumakbokan),
	lynn: asHeroDetail(lynn),
	magnus: asHeroDetail(magnus),
	mia: asHeroDetail(mia),
	molly: asHeroDetail(molly),
	natalia: asHeroDetail(natalia),
	norah: asHeroDetail(norah),
	patrick: asHeroDetail(patrick),
	philly: asHeroDetail(philly),
	reina: asHeroDetail(reina),
	renee: asHeroDetail(renee),
	rufus: asHeroDetail(rufus),
	seoyoon: asHeroDetail(seoyoon),
	sergey: asHeroDetail(sergey),
	smith: asHeroDetail(smith),
	sonya: asHeroDetail(sonya),
	vulcanus: asHeroDetail(vulcanus),
	wayne: asHeroDetail(wayne),
	"wu-ming": asHeroDetail(wuMing),
	xura: asHeroDetail(xura),
	zinman: asHeroDetail(zinman),
};

export function getHeroDetailData(id: string): HeroDetail | undefined {
	const normalizedId = normalizeHeroDetailId(id);

	return HERO_DETAILS[normalizedId];
}

function normalizeHeroDetailId(value: string): string {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[_\s]+/g, "-")
		.replace(/[^a-z0-9-]+/g, "")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
}
