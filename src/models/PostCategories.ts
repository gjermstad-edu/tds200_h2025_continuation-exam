export enum InjuryLocation {
  Ankle = 'ankel',
  Knee = 'kne',
  Shoulder = 'skulder',
  Hip = 'hofte',
  Wrist = 'håndledd',
  Elbow = 'albue',
  Back = 'rygg',
  Neck = 'nakke',
  Other = 'annen',
}

export const injuryLocationLabel = (loc: InjuryLocation): string => {
  switch (loc) {
    case InjuryLocation.Ankle: return 'Ankel';
    case InjuryLocation.Knee: return 'Kne';
    case InjuryLocation.Shoulder: return 'Skulder';
    case InjuryLocation.Hip: return 'Hofte';
    case InjuryLocation.Wrist: return 'Håndledd';
    case InjuryLocation.Elbow: return 'Albue';
    case InjuryLocation.Back: return 'Rygg';
    case InjuryLocation.Neck: return 'Nakke';
    case InjuryLocation.Other: return 'Annen';
    default: return 'Annen';
  }
};