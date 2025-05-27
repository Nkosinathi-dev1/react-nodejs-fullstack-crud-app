import { useState, useEffect } from 'react';
import Places from './Places.jsx';
import Error from './Error.jsx';
import { fetchAvailablePlaces } from '../http.js';
import {sortPlacesByDistance} from '../loc.js';

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isFetching, setIsfetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaces = async ()=>{
      setIsfetching(true);
      try{
        const places = await  fetchAvailablePlaces()
        navigator.geolocation.getCurrentPosition((position)=>{
          //sort places by distance before setting state
          const sortedPlaces = sortPlacesByDistance(places, position.coords.latitude, position.coords.longitude);
          //now set the sorted places to state
          setAvailablePlaces(sortedPlaces)
          setIsfetching(false); 
        });

      }catch(error){
        setError({message: error.message || 'Something went wrong!'});
        setIsfetching(false); 
      }     
    }
    fetchPlaces();
  }, []);

  if (error) {
    return (
      <Error
        title="An error occurred"
        message={error.message}
        // onConfirm={() => setError(null)}
      />
    );
  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading={isFetching}
      loadingText = "Loading places..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
