// components/CurrentLocation.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import * as Location from "expo-location";

/*
/ Denne koden er delvis basert på kodebasene fra forelesninger i faget TDS200 ved Høyskolen Kristiania høsten 2025.
/ Brukt med tillatelse.
*/

type Coords = {
  latitude: number;
  longitude: number;
};

type CurrentLocationProps = {
  handleLocation: (data: { coords: Coords; address: string }) => void;
};
export default function CurrentLocation({
  handleLocation,
}: CurrentLocationProps) {
  const [location, setLocation] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function getAddressFromCoords(lat: number, lon: number) {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      console.warn("Geocoding failed:", data.status);
      return "Ukjent adresse";
    }
  }

  const getLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Tillatelse til å bruke posisjon ble nektet");
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      const currentAddress = await getAddressFromCoords(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
      );
      setAddress(currentAddress);

      handleLocation({
        coords: currentLocation.coords,
        address: currentAddress,
      });
    } catch (error) {
      console.error("Location error:", error);
      setErrorMsg("Kunne ikke hente posisjon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="mt-4 mb-6 p-3 border border-gray-300 rounded-lg bg-gray-50">
      <Text className="text-gray-700 font-semibold mb-2">📍 Lokasjon</Text>

      {errorMsg && <Text className="text-red-500 mb-2">{errorMsg}</Text>}

      {location ? (
        <Text className="text-gray-600 mb-2">
          Latitude: {location.latitude} | Lonitude: {location.longitude}
        </Text>
      ) : (
        <Text className="text-gray-500 mb-2">Ingen posisjon valgt</Text>
      )}

      {address ? (
        <Text className="text-gray-600 italic mt-1">Adresse: {address}</Text>
      ) : (
        <Text className="text-gray-400 italic mt-1">Ukjent adresse</Text>
      )}

      <Pressable
        onPress={getLocation}
        className="bg-blue-500 py-2 px-4 rounded-md"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-center">
            Hent posisjon
          </Text>
        )}
      </Pressable>
    </View>
  );
}
