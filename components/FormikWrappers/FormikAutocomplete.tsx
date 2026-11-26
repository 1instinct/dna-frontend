import React, { useState, useEffect } from "react";
// import { setFieldValue } from 'formik';
import { useField } from "formik";

import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete";

import {
  Error,
  HiddenInput,
  BasicField,
  SuggestionWrapper,
  SuggestionLoader,
  SuggestionItem
} from "./FormikInput.styles";
import { fieldA11y, FieldLabel } from "./fieldA11y";

// interface FormikAutocompleteType {
//   name: string;
//   type: string;
//   placeholder: string;
//   props: any;
// }

export const FormikAutocomplete = ({
  field,
  form: { setFieldValue, touched, errors },
  form,
  addressType,
  ...props
}: any) => {
  const [homeAddress, setHomeAddress] = useState("");
  const [addressSelected, setAddressSelected] = useState(false);

  // const { setTouched, setFieldValue, name } = props;

  const handleChange = (input: any) => {
    // console.log('changing');
    setAddressSelected(false);
    setHomeAddress(input);
    // setFieldValue(name, search, false);
  };

  const handleSelect = (address: any) => {
    // geocodeByAddress(address)
    //   .then(results => getLatLng(results[0]))
    //   .then(latLng => console.log('Success', latLng))
    //   .catch(error => console.error('Error', error));
    setAddressSelected(true);
    setHomeAddress(address.address);
    setFieldValue(address.name, address.address, false);
  };

  const addressTitle = addressType ? addressType + " " : null;
  const labelText = addressTitle ? addressTitle + "Address" : "Address";
  const a11y = fieldA11y({ name: field.name, id: props.id, touched, errors });
  const listboxId = `${a11y.inputId}-suggestions`;
  const showSuggestions = !addressSelected && homeAddress !== "";

  return (
    <>
      <FieldLabel htmlFor={a11y.inputId}>{props.label || labelText}</FieldLabel>
      <PlacesAutocomplete
        value={homeAddress || field.value}
        onChange={handleChange}
        onSelect={(address) => handleSelect({ name: field.name, address })}
      >
        {({ suggestions, getInputProps, getSuggestionItemProps, loading }) => (
          <>
            <BasicField
              {...getInputProps({
                className: "location-search-input",
                ...a11y.inputProps,
                "aria-controls": showSuggestions ? listboxId : undefined
              })}
              type="text"
              placeholder={labelText}
              // selectedTheme="dark"
              // invalid={Boolean(touched[fields.name] && errors[fields.name])}
            />
            {showSuggestions && (
              <SuggestionWrapper
                id={listboxId}
                role="listbox"
                aria-label={`${props.label || labelText} suggestions`}
              >
                {loading && <SuggestionLoader>Loader...</SuggestionLoader>}
                {suggestions.map((suggestion) => {
                  const className = suggestion.active
                    ? "suggestion-item active"
                    : "suggestion-item";
                  return (
                    <SuggestionItem
                      key={suggestion.placeId}
                      {...getSuggestionItemProps(suggestion, {
                        className
                      })}
                    >
                      <span>{suggestion.description}</span>
                    </SuggestionItem>
                  );
                })}
              </SuggestionWrapper>
            )}
          </>
        )}
      </PlacesAutocomplete>
      {/* <HiddenInput>
            <Input id="dateOfBirth" {...props} {...fields} invalid={Boolean(touched[fields.name] && errors[fields.name]).toString()}/>
          </HiddenInput> */}
      {/* <Autocomplete id="homeAddress"
            {...props}
            {...fields}
            invalid={Boolean(touched[fields.name] && errors[fields.name])}
            value={props.value}
            onChange={ event => setHomeAddress(name, event.target.value) }
            // onChange={ () => console.log('TYPE TYPE')}
            onBlur={ () => setTouched({ [name]: true }) }
          /> */}
      {/* {touched[field.name] && errors[field.name] ? <Error>{errors[field.name]}</Error> : ""} */}
    </>
  );
};
