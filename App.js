
import {StatusBar} from "expo-status-bar";
import React from "react";
import ReactDOM from "react-dom";
import {StyleSheet, Text, View, ScrollView} from "react-native";
import {NativeRouter, Switch, Route, Router, Link} from "react-router-native";
import Home from "./src/views/Home.js";
import MovieList from "./src/views/MovieList.js";
import Navigation from "./src/components/Navigation.js";
import { NavigationContainer } from '@react-navigation/native';
import BottomNav from "./src/components/BottomTab.js";
import HomeStack from './src/components/stackNav';
import Auth from "./src/components/Auth.js";
import RoomView from "./src/components/RoomView.js";
import {
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_DB_URL,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_PROJECT_ID,
    FIREBASE_APP_ID
} from '@env';
import * as firebase from "firebase";
import "firebase/firestore";
import "firebase/auth";

//set up firebase configuration from environment variables

console.log(FIREBASE_API_KEY);
const firebase_config = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    databaseURL: FIREBASE_DB_URL,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    projectId: FIREBASE_PROJECT_ID,
    appId: FIREBASE_APP_ID,
};

console.log(firebase_config);

!firebase.apps.length ? firebase.initializeApp(firebase_config) : firebase.app();

const firestore = firebase.firestore();
const firebaseAuth = firebase.auth();

export default function App() {
    return (
        <NavigationContainer>
            <BottomNav/>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({});
