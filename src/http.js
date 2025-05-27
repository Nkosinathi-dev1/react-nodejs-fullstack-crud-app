
export const fetchAvailablePlaces = async () => {
    const res = await fetch('http://localhost:3000/places')
    const data = await res.json()
    if(!res.ok){
        throw new Error('Could not fetch places.');
    }
    
    return data.places;
}

export const fetchUserPlaces = async () => {
    const res = await fetch('http://localhost:3000/user-places')
    const data = await res.json()
    if(!res.ok){
        throw new Error('Could not fetch user places.');
    }
    
    return data.places;
}


export const updateUserPlaces = async (places) => {
    const res = await fetch('http://localhost:3000/user-places', {
        method: 'PUT',
        body: JSON.stringify({places}),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error('Could not update user places.');
    }
    return data.message;
}