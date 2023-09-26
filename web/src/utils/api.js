import axios from 'axios';
import jwt_decode from 'jwt-decode';
import setAuthToken from '../utils/setAuthToken';

const baseURL = 'http://localhost:5000/api/v1';
const client = axios.create({ baseURL });
const client_post = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } });
const client_form = axios.create({ baseURL, headers: { 'Content-Type': 'multipart/form-data' } });

export const googleRedirectURL = baseURL + "/users/googleAuth";

export const fetch_templates = async () => {
    const res = await client.get('/templates');
    return res.data;
}

export const handle_user_signIn = async (isLoggedIn, payload) => {
    const res = await client_post.post('/users/signin', payload);
    const { token } = res.data;
    isLoggedIn ? localStorage.setItem('jwtToken', token) : sessionStorage.setItem('jwtToken', token);
    setAuthToken(token);
    const loginData = jwt_decode(token);
    const response = { ...loginData, isSignedIn: true };
    return response;
}

export const handle_user_signUp = async (payload) => {
    const res = await client_post.post('/users/signup', payload);
    const { token } = res.data;
    sessionStorage.setItem('jwtToken', token);
    setAuthToken(token);

    const loginData = jwt_decode(token);
    const response = { ...loginData, isSignedIn: true };
    return response;
}

export const handle_user_signOut = async () => {
    if (localStorage.jwtToken) {
        localStorage.clear();
    } else if (sessionStorage.jwtToken) {
        sessionStorage.clear();
    }
}

export const fetch_user_info = async (userID, isLoggedIn) => {
    const res = await client.get(`/users/${userID}`);
    const { token } = res.data;
    if (localStorage.jwtToken) {
        localStorage.setItem('jwtToken', token);
    } else if (sessionStorage.jwtToken) {
        sessionStorage.setItem('jwtToken', token);
    }
    const userData = jwt_decode(token);
    return userData;
}

export const update_user_info = async (userID, payload) => {
    await client_post.put(`/users/${userID}`, payload);
    return;
}

export const delete_user = async (userID) => {
    await client.delete(`/users/${userID}`);
    if (localStorage.jwtToken) {
        localStorage.clear();
    } else if (sessionStorage.jwtToken) {
        sessionStorage.clear();
    }
    return;
}

export const create_user_draft = async (payload) => {
    await client_post.post('/drafts/create', payload);
    return;
}

export const fetch_user_drafts = async (userID) => {
    const res = await client.get(`/users/${userID}/drafts`);
    return res.data;
}

export const delete_user_draft = async (draftID) => {
    await client.delete(`/drafts/${draftID}`);
    return;
}

export const duplicate_user_draft = async (payload) => {
    await client_post.post('/drafts/duplicate', payload);
    return;
}

export const edit_user_draft = async (draftID, payload) => {
    await client_post.put(`/drafts/${draftID}`, payload);
    return;
}

export const fetch_draft = async (draftID) => {
    const res = await client.get(`/drafts/${draftID}`);
    return res.data;
}