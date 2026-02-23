import { Picker } from "@react-native-picker/picker";
import { InjuryLocation, injuryLocationLabel } from "@/models/PostCategories";

// Henter ut alle enum-verdiene
const allLocations = Object.values(InjuryLocation);

type Props = {
  selectedLocation: InjuryLocation | null;
  onChange: (location: InjuryLocation) => void;
};

export default function InjuryLocationPicker({
  selectedLocation,
  onChange,
}: Props) {
  return (
    <Picker
      selectedValue={selectedLocation ?? ""}
      onValueChange={(value) => {
        if (!value) return;
        onChange(value as InjuryLocation);
      }}
      className="bg-white border border-gray-300 rounded-lg p-2"
    >
      <Picker.Item label="Velg skadelokasjon..." value="" />

      {allLocations.map((location) => (
        <Picker.Item
          key={location}
          label={injuryLocationLabel(location)}
          value={location}
        />
      ))}
    </Picker>
  );
}
