import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, } from 'react-native';
import {createStackNavigator} from "react-navigation"
import {YellowBox, 
    KeyboardAvoidingView,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback,
    Platform, 
    ScrollView,
    TextInput,
    StatusBar
} from 'react-native';


import { SkypeIndicator } from 'react-native-indicators';
import moment from 'moment';
import MapView from 'react-native-maps';

import Global from '../../utils/Global/Global'
import {getInset} from 'react-native-safe-area-view'

const bottomOffset = getInset('bottom');

// YellowBox.ignoreWarnings(["Require cycle:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var topviewHeight = Platform.OS == 'android' ? 80 - StatusBar.currentHeight : 80;
var tabbarHeight = 50
var main_viewHeight = Platform.OS == 'android' ? deviceHeight - topviewHeight - (tabbarHeight + 5) - StatusBar.currentHeight : deviceHeight - topviewHeight - (tabbarHeight + 5) - bottomOffset;/// bottom tabbar height
var title_view_height = 60;
var content_view_height = main_viewHeight - title_view_height;

export default class AccountLocation extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null
	};

	constructor(props){
		super();

		this.state = {
            isVisible : true,
            isReady: false,
            showIndicator: false,
         
            selectedLat: Global.user_loc_lat,
            selectedLng: Global.user_loc_lng,

            map_region: {
                latitude: Global.user_loc_lat,
                longitude: Global.user_loc_lng,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015
            }
		}
    };
    
    async componentWillMount() {
    };

    async componentDidMount() {
        
    };

    addMarker(coordinate) {
        this.setState({
            selectedLat: coordinate.latitude,
            selectedLng: coordinate.longitude
        })
    }

    select_location() {
        Global.acc_tmp_lat = this.state.selectedLat;
        Global.acc_tmp_lng = this.state.selectedLng;
        this.props.navigation.navigate("Myaccount");
    }

    render() {
        return (
            <View style={styles.container}>
            {
                this.state.showIndicator &&
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 100}}>
                    <View style = {{flex: 1}}>
                        <SkypeIndicator color = '#ffffff' />
                    </View>
                </View>
            }
                {/* <ImageBackground style = {styles.background_view} resizeMode = {'stretch'} source = {require('../assets/images/bg_signup.png')}> */}
                    <View style = {styles.main_view}>
                        <View style = {styles.title_view}>
                            <Text style = {{color: '#072B4F', fontSize: 24, fontFamily: 'Lato-Regular'}}>Select Location</Text>
                        </View>
                        <MapView style = {styles.map_view}
                            region = {this.state.map_region}
                            onPress = {(e) => this.addMarker(e.nativeEvent.coordinate)}
                        >
                            <MapView.Marker
                                coordinate = {{
                                    latitude: this.state.selectedLat,
                                    longitude: this.state.selectedLng
                                }}
                                title = {"Selected Location"}
                                // description = {"Marker Description"}
                            />
                        </MapView>
                    </View>
                    <View style = {styles.button_view}>
                        <TouchableOpacity style = {styles.button} onPress = {() => this.props.navigation.navigate("Myaccount")}>
                            <Text style = {{color: '#000000', fontSize: 20, fontFamily: 'Lato-Regular', marginLeft: 5}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.button} onPress = {() => this.select_location()}>
                            <Text style = {{color: '#000000', fontSize: 20, fontFamily: 'Lato-Regular', marginLeft: 5}}>Select</Text>
                        </TouchableOpacity>
                    </View>
                {/* </ImageBackground> */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    background_view: {
        width: '100%', 
        height: '100%', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    main_view: {
        width: '80%',
        // height: '60%',

    },
    title_view: {
        width: '80%', 
        height: 50, 
        justifyContent: 'center'
    },
    map_view: {
        width: '100%',
        height: deviceHeight * 0.6
    },
    comment_view: {
        width: '80%', 
        height: 50, 
        justifyContent: 'center',
        marginTop: 10
    },
    input_title_text: {
        width: '100%', 
        height: '50%', 
        color: '#808080', 
        fontSize: 18, 
        fontFamily: 'Lato-Regular', 
    },
    input_view: {
        width: '100%', 
        height: 60, 
        borderBottomColor: '#808080', 
        borderBottomWidth: 1, 
        // justifyContent: 'center', 
        alignItems: 'stretch',
        marginBottom: 10
    },
    input_text: {
        width: '100%', 
        height: '50%', 
        color: '#072B4F', 
        fontSize: 15, 
        fontFamily: 'Lato-Regular', 
        padding: 0,
    },
    accep_termsview: {
        width: '100%', 
        height: 20, 
        alignItems: 'center', 
        flexDirection: 'row'
    },
    keepsigin_button: {
        width: 12, 
        height: 12, 
        borderRadius: 12, 
        borderColor: '#ff0000', 
        borderWidth: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    button_view: {
        width: '100%', 
        height: 40, 
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    button: {
        width: '40%', 
        height: '100%', 
        borderRadius: 10, 
        borderColor: '#000000', 
        borderWidth: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },

});
