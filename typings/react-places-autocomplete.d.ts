declare module "react-places-autocomplete" {
  import { ComponentType, ReactNode } from "react";

  interface PlacesAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (value: string, placeId?: string) => void;
    searchOptions?: any;
    children: (props: {
      getInputProps: (options?: any) => any;
      suggestions: any[];
      getSuggestionItemProps: (suggestion: any, options?: any) => any;
      loading: boolean;
    }) => ReactNode;
  }

  const PlacesAutocomplete: ComponentType<PlacesAutocompleteProps>;
  export function geocodeByAddress(address: string): Promise<any>;
  export function getLatLng(results: any): Promise<{ lat: number; lng: number }>;
  export default PlacesAutocomplete;
}