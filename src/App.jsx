import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import { updateUserPlaces, fetchUserPlaces } from './http.js';
import Error from './components/Error.jsx';

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [isFetching, setIsfetching] = useState(false);
  const [error, setError] = useState(null);

  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();

  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() =>{
    const fetchPlaces = async ()=>{
      setIsfetching(true);
      try {
        const userPlaces = await fetchUserPlaces();
        setUserPlaces(userPlaces);
      } catch (error) {
        setError({message: error.message || 'Could not fetch user places.'});
      }
      setIsfetching(false);
    }
    fetchPlaces();
  }, []);


  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    // await updateUserPlaces([selectedPlace, ...userPlaces]); // This is another approach that will work spinner
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      await updateUserPlaces([selectedPlace, ...userPlaces]);
    } catch (error) {
      //This is optimistic UI update, so we need to revert the state if the update fails
      setUserPlaces(userPlaces) // Revert to previous state if update fails
      setErrorUpdatingPlaces({message: error.message || 'Could not update places.'});
    }
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );

    try {
      await updateUserPlaces(userPlaces.filter((place) => place.id !== selectedPlace.current.id))
      
    } catch (error) {
      setUserPlaces(userPlaces); // Revert to previous state if update failsS
      setErrorUpdatingPlaces({message: error.message || 'Could not delet a place.'});
    }

    setModalIsOpen(false);
  }, [userPlaces]);

  function handleErrorModalClose() {
    setErrorUpdatingPlaces(null);
  }

  return (
    <>
      <Modal open={errorUpdatingPlaces} onClose={handleErrorModalClose}>
        {errorUpdatingPlaces &&
        <Error title="An error occured" 
        onConfirm={handleErrorModalClose}
        message={errorUpdatingPlaces?.message || 'Could not update places.'}
        />}
      </Modal>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && (
          <Error
            title="An error occurred"
            message={error.message}
          />
        )}

        {!error &&(
          <Places
          title="I'd like to visit ..."
          fallbackText="Select the places you would like to visit below."
          isLoading={isFetching}
          loadingText="Loading your places..."
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
