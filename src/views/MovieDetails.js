import React, {Component, useEffect, useState} from "react";
import {
    Text,
    Button,
    View,
    StyleSheet,
    FlatList,
    ActivityIndicator, NativeEventEmitter,
    SafeAreaView,
    ImageBackground,
    ScrollView,
    Image,
    SectionList
} from "react-native";
import {TMDB_KEY} from "@env";
import { ListItem, SearchBar, Avatar } from 'react-native-elements';
import LinearGradient from "expo-linear-gradient";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { swGrey } from "../styles/Colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as firebase from "firebase";
import "firebase/firestore";
import "firebase/auth";
import {connect} from "react-redux"
import {getWatchList, updateWatchList} from "../api/WatchListApi.js"

class MovieDetails extends Component{

    constructor(props){
        super(props);
        this.id;
        this.state = {
            loading: false,
            data: [],
            error: null,
            genres: "",
            year:"",
            inWatchlist: false
        };
    }

    componentDidMount(){
        //console.log(this.props);
        console.log("name: "+this.props.route.params.name+"=========");
        this.id = this.props.route.params.id;
        console.log(this.id);
        this.getWatchlistInfo()
        this.makeRemoteRequest();
    }

    getWatchlistInfo = async() =>{
        try {
            var userIDkey = this.props.customUser.watchListId;
            var userWatchList = await getWatchList(userIDkey);
            userWatchList.forEach((movie)=>{
                var i;
                for(i = 0; i<userWatchList.length; i++){
                    if(this.id==movie.id){
                        this.setState({
                            inWatchlist:true
                        });
                    }
                }
            })
            this.props.updateWatchList(userWatchList);
        } catch (error) {
            console.log(error)
        }
    }

    makeRemoteRequest = () => {
        this.setState({ loading: true});
        const url = "https://api.themoviedb.org/3/movie/"+this.id+"?api_key="+TMDB_KEY;
        console.log(url);
        fetch(url)
        .then(res => res.json())
        .then(res => {
            //console.log(res);
            let temp = [];
            res.genres.forEach(element => temp.push(element.name));
            while(temp.length>4){
                temp.pop();
            }
            this.setState({
                loading:false,
                data:res,
                genres:temp.join(" • "),
                year:res.release_date.substring(0,4)
            });
            console.log(this.state.genres);
        })
        .catch(error =>{
            this.setState({
                error,
                loading:false
            });
        })
    }

    toggleInWatchlistRequest = () =>{
        if(this.state.inWatchlist){
            this.removeMovieFromWatchList();
        }else{
            this.addMovieToWatchList();
        }
    }

    removeMovieFromWatchList = ()=>{
        try {
            let tempWatchList = this.props.watchList.filter((movie) =>{
                console.log(this.id);
                console.log(movie.id);
                console.log(movie.id !== this.id);
                console.log("=======");
                return (movie.id !== this.id)
            });
            console.log("~~~~~:~~~~~~")
            console.log(tempWatchList);
            //var userIDkey = this.props.customUser.watchListId;
            //var userWatchList = await getWatchList(userIDkey);
            // userWatchList = userWatchList.filter((movie) => {
            //     if (movie.id == this.id){
            //         return false;
            //     }
            //     return true;
            // })
            // let watchListObject = {
            //     movies: this.props.watchList,
            //     creatorID: firebase.auth().currentUser.uid
            // }
            // updateWatchList(userIDkey, watchListObject);
            this.props.updateWatchList(tempWatchList);
            firebase.firestore()
                .collection("watchList")
                .doc(this.props.customUser.watchListId)
                .update({movies:tempWatchList})
                .catch(error=>{
                    console.warn(error);
                })
            //console.log(watchListObject);
        } catch (error) {
            console.log(error)
        }
    }

    addMovieToWatchList = ()=>{
        try {
            //var userWatchList = await getWatchList(this.props.customUser.watchListId);
            var currentMovie = {
                description:this.state.data.overview,
                id:this.id,
                name:this.state.data.title,
                posterPath:this.state.data.poster_path
            }
            let temp = [...this.props.watchList]
            console.log(temp)
            temp.push(currentMovie)
            console.log(temp);
            //this.props.watchList.push(currentMovie);
            // let watchListObject = {
            //     movies: userWatchList,
            //     creatorID: this.props.customUser.watchListId
            // }
            //updateWatchList(this.props.customUser.watchListId, watchListObject);
            this.props.updateWatchList(temp);
            console.log("===========");
            console.log(this.props.watchList);
            firebase.firestore()
                .collection("watchList")
                .doc(this.props.customUser.watchListId)
                .update({movies:temp})
                .then(()=>{
                    //console.log("~~~~~~~~~~~~~~~~~~~~~~")
                    // firebase.firestore()
                    //     .collection("watchList")
                    //     .doc(this.props.customUser.watchListID)
                    //     .get()
                    //     .then((wldoc) => {
                    //         console.log(wldoc.data());
                    //         this.props.updateWatchList(wldoc.data().movies);
                    //         console.log("----");
                    //         console.log(this.props.watchList);
                    //         console.log("----");
                    //     })
                    //     .catch(error =>{
                    //         console.log(error);
                    //     });
                    // console.log(this.props.watchList);
                    // console.log("~~~~~~~~~~~~~~~~~~~~~~")
                })
                .catch(error=>{
                    console.warn(error);
                });
            //console.log(watchListObject);

        } catch (error) {
            console.log(error)
        }
    }


    render(){
        if(this.state.loading){
            return (
            <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator/>
            </SafeAreaView>
            );
        }else{
            return (
                <SafeAreaView>
                    <ScrollView height="100%" backgroundColor={swGrey}>
                    <ImageBackground opacity={1} source={{uri:"https://image.tmdb.org/t/p/w1280"+this.state.data.poster_path}}
                    style={{ width: '100%', height: undefined, aspectRatio:2/3}}>
                        <View style={styles.container}>
                            <Text style={styles.title}>{this.state.data.title + " (" + this.state.year + ")"}</Text>
                            <Text numberOfLines={3} style={styles.description}>{this.state.data.overview}</Text>
                            <View style = {{flexDirection:'row'}}>
                                <Text style={styles.detail}>{this.state.genres}</Text>
                                <Text style={styles.detail}>|</Text>
                                <Text style={styles.detail}>{""+Math.floor(this.state.data.runtime/60)+"h "+this.state.data.runtime%60+"m"}</Text>
                            </View>
                        </View>
                        <View style={styles.buttonRow}>
                                <TouchableOpacity style={{alignContent:"center",paddingLeft:"20%" , paddingBottom:"90%"}}
                                    onPress={() => {
                                        this.setState({
                                            inWatchlist:!this.state.inWatchlist
                                        })
                                        this.toggleInWatchlistRequest();
                                    }
                                }>
                                    <MaterialCommunityIcons
                                    style={styles.buttonIcon}
                                    name= {(this.state.inWatchlist)? "playlist-check":"playlist-plus"}
                                    color="#ffffff" size ={32}
                                    />
                                    <Text style={styles.buttonLabel}>{(this.state.inWatchlist)?"Remove from Watchlist":"Add to Watchlist"}</Text>
                                </TouchableOpacity>
                        </View>
                    </ImageBackground>
                    <View>

                    </View>
                    </ScrollView>
                </SafeAreaView>
            );
        }
    }

}

function mapStateToProps(state){
    return {
        customUser: state.customUser,
        watchList: state.watchList
    }
}

function mapDispatchToProps(dispatch){
    return{
        updateWatchList: (watchList)=> dispatch({
            type:"UPDATEWATCHLIST",
            payload: watchList
        })
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MovieDetails)


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: "center",
    },
    linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5
    },
    title: {
        fontWeight:"700",
        textAlign: "left",
        color:"#ffffff",
        fontSize:35,
        marginTop:"50%",
        paddingLeft:"7.5%",
        paddingRight:"7.5%"
    },
    description: {
        textAlign: "left",
        color:"#ffffff",
        fontSize:11,
        marginTop:"1%",
        paddingLeft:"5%",
        paddingRight:"25%"
    },
    detail: {
        textAlign: "left",
        color:"#ffffff",
        fontWeight:'500',
        fontSize:13,
        marginTop:"1%",
        paddingLeft:"4%",
    },
    buttonLabel: {
        textAlign: "center",
        width:"45%",
        color:"#ffffff",
        fontWeight:'500',
        fontSize:11,
        marginTop:"1%",
        paddingLeft:"0%",
    },
    buttonIcon: {
        paddingLeft:"4.8%",
    },
    buttonRow: {
        flexDirection: "row",
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
});
