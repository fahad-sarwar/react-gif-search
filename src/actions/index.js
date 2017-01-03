import request from 'superagent';
import { browserHistory } from 'react-router';
import Firebase from 'firebase';

export const REQUEST_GIFS = 'REQUEST_GIFS';
export const FETCH_FAVORITED_GIFS = 'FETCH_FAVORITED_GIFS';
export const OPEN_MODAL = 'OPEN_MODAL';
export const CLOSE_MODAL = 'CLOSE_MODAL';
export const SIGN_OUT_USER = 'SIGN_OUT_USER';
export const AUTH_ERROR = 'AUTH_ERROR';
export const AUTH_USER = 'AUTH_USER';

const API_URL = 'http://api.giphy.com/v1/gifs/search?q=';
const API_KEY = '&api_key=dc6zaTOxFJmzC';

var config = {
    apiKey: "AIzaSyC3Jx6-gflHbkJmkXu42d1CvT8RoyiVl64",
    authDomain: "react-gif-search-63b8f.firebaseapp.com",
    databaseURL: "https://react-gif-search-63b8f.firebaseio.com",
    storageBucket: "react-gif-search-63b8f.appspot.com",
    messagingSenderId: "589319060037"
};

Firebase.initializeApp(config);

export function requestGifs(term = null) {
    return function (dispatch) {
        request.get(`${API_URL}${term.replace(/\s/g, '+')}${API_KEY}`).then(response => {
            dispatch({
                type: REQUEST_GIFS,
                payload: response
            });
        });
    }
}

export function favoriteGif({selectedGif}) {
    const userUid = Firebase.auth().currentUser.uid;
    const gifId = selectedGif.id;

    return dispatch => Firebase.database().ref(userUid).update({
        [gifId]: selectedGif
    });
}

export function unfavoriteGif({selectedGif}) {
    const userUid = Firebase.auth().currentUser.uid;
    const gifId = selectedGif.id;

    return dispatch => Firebase.database().ref(userUid).child(gifId).remove();
}

export function fetchFavoritedGifs() {
    return function (dispatch) {
        const userUid = Firebase.auth().currentUser.uid;

        Firebase.database().ref(userUid).on('value', snapshot => {
            dispatch({
                type: FETCH_FAVORITED_GIFS,
                payload: snapshot.val()
            })
        });
    }
}

export function openModal(gif) {
    return {
        type: OPEN_MODAL,
        gif
    }
}

export function closeModal() {
    return {
        type: CLOSE_MODAL
    }
}

export function signUpUser(credentials) {
    return function (dispatch) {
        Firebase.auth().createUserWithEmailAndPassword(credentials.email, credentials.password)
            .then(response => {
                dispatch(authUser());
                browserHistory.push('/favorites');
            })
            .catch(error => {
                console.log(error);
                dispatch(authError(error));
            });
    }
}

export function signInUser(credentials) {
    return function (dispatch) {
        Firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
            .then(response => {
                dispatch(authUser());
                browserHistory.push('/favorites');
            })
            .catch(error => {
                dispatch(authError(error));
            });
    }
}

export function signOutUser() {
    browserHistory.push('/');

    return {
        type: SIGN_OUT_USER
    }
}

export function verifyAuth() {
    return function (dispatch) {
        Firebase.auth().onAuthStateChanged(user => {
            if (user) {
                dispatch(authUser());
            } else {
                dispatch(signOutUser());
            }
        });
    }
}

export function authUser() {
    return {
        type: AUTH_USER
    }
}

export function authError(error) {
    return {
        type: AUTH_ERROR,
        payload: error
    }
}