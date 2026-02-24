import { getRemoteFilteredPosts } from "@/api/postApi";
import { InjuryLocation } from "@/models/PostCategories";
import { InjuryStatus, PostData } from "@/models/PostData";

function calculatePain(prevPain: number, nowPain: number): number {
    // > 0 = forbedring / 0 = stabilt / < 0 = forverring
    // Endring på >= 3 er signifikant og gir +/-2poeng
    // Endring på 2 er verdt å merke og gir +/-1 poeng
    // Ingen eller endring på 1 regnes ikke og gir 0 poeng

    const differenceInPain = prevPain-nowPain;

    switch(differenceInPain) {
        case 10:
        case 9:
        case 8:
        case 7:
        case 6:
        case 5:
        case 4:
        case 3:
            return 2;
        case 2:
            return 1;
        case 1:
        case 0:
        case -1:
            return 0;
        case -2:
            return -1
        case -3:
        case -4:
        case -5:
        case -6:
        case -7:
        case -8:
        case -9:
        case -10:
            return -2
        default:
            return 0;
    }
}
function calculateTemperature(prevTemp: number, nowTemp: number): number {
    // > 0 = forbedring / 0 = stabilt / < 0 = forverring
    // Endring på >= 3 er signifikant og gir +/-2poeng
    // Endring på 2 er verdt å merke og gir +/-1 poeng
    // Ingen eller endring på 1 regnes ikke og gir 0 poeng
    const differenceInTemp = prevTemp-nowTemp

    switch(differenceInTemp) {
        case 8:
        case 7:
        case 6:
        case 5:
        case 4:
        case 3:
            return 2;
        case 2:
            return 1;
        case 1:
        case 0:
        case -1:
            return 0;
        case -2:
            return -1;
        case -3:
        case -4:
        case -5:
        case -6:
        case -7:
        case -8:
            return -2;
        default:
            return 0;
            
    }
}

function calculateBooleans(prevState: boolean, nowState: boolean): number {
    // > 0 = forbedring / 0 = stabilt / < 0 = forverring
    // false → false = ingen endring (0)
	// true → true = ingen endring (0)
	// false → true = forverring (−1)
	// true → false = forbedring (+1)

    if (prevState == nowState) {
        return 0
    } else if (prevState == false && nowState == true) {
        return -1
    } else {
        return 1
    }
}

function setExplaination(sumPoints: number): string {
    let statusExplaination: string = "";

    if(sumPoints >0){
        statusExplaination += "Din status siden sist er: FORBEDRET. "
    } else if (sumPoints == 0){
        statusExplaination += "Din status siden sist er: STABIL. "
    } else if (sumPoints < 0) {
        statusExplaination += "Din status siden sist er: FORVERRET. "
    } else {
        statusExplaination += "ERROR: Noe gikk feil i beregningen - Kontakt kundeservice. "
    }

    statusExplaination += "Beregnet basert på endringer i smerte, hevelse, mobilitet og temperatur siden forrige registrering."

    return statusExplaination;
}

export async function calculateStatus(
    injury: InjuryLocation, 
    painLevel: number, 
    swelling: boolean, 
    limitedMobility: boolean, 
    temperature: number,
    oldPosts: PostData[]) 
{
  console.log("Running calculateStatus")

  console.log(oldPosts)
  
  // Lagrer siste registrerte skade på injuryLocation
  const previousInjury = oldPosts[0];
  const earlierInjuryRegistered = previousInjury != undefined

  let statusSumPoints: number = 0;
  let status: InjuryStatus = "ny skade";
  let statusExplanation: string = ""

  if (earlierInjuryRegistered) {
    const painPoints = calculatePain(previousInjury.painLevel, painLevel);
    const tempPoints = calculateTemperature(previousInjury.temperature, temperature);
    const swellingPoints = calculateBooleans(previousInjury.swelling, swelling);
    const mobilityPoints = calculateBooleans(previousInjury.mobilityLimit, limitedMobility);
    console.log(`Smertenivå - Før: ${previousInjury.painLevel} / Nå: ${painLevel} (= ${previousInjury.painLevel-painLevel})`)
    console.log(`Hevelse - Før: ${previousInjury.swelling} / Nå: ${swelling}`)
    console.log(`Bevegelsehemming - Før: ${previousInjury.mobilityLimit} / Nå: ${limitedMobility}`)
    console.log(`Temperatur - Før: ${previousInjury.temperature} / Nå: ${temperature} (= ${previousInjury.temperature-temperature})`)

    statusSumPoints = painPoints + tempPoints + swellingPoints + mobilityPoints;

    console.log(`Statuspoeng totalt: ${statusSumPoints}`)

    statusExplanation += setExplaination(statusSumPoints);

    if (statusSumPoints >= 1) status = "forbedres"
    if (statusSumPoints <= -1) status = "forverres"
    if (statusSumPoints == 0) status = "stabil"
  } else {
    statusExplanation = `Ny skade registrert. Det er ikke registrert noen tidligere skade på "${injury}" så status settes til "Ny skade".`
  }

  console.log(`Resultat - Status: ${status} / Forklaring: ${statusExplanation}`)
  return {status: status, StatusExplaination: statusExplanation}
};