import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, } from 'react-native';
import {createStackNavigator} from "react-navigation"
import {YellowBox, 
    KeyboardAvoidingView,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
    ImageBackground,
    PermissionsAndroid
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

import { BallIndicator } from 'react-native-indicators';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import MapView from 'react-native-maps';
import Global from '../utils/Global/Global'

// YellowBox.ignoreWarnings(["Require cycle:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHight = Dimensions.get('window').height;

export default class LocationSelection extends Component {
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
         
            selectedLat: props.navigation.state.params.selectedLat,
            selectedLng: props.navigation.state.params.selectedLng,

            map_region: {
                latitude: props.navigation.state.params.selectedLat,
                longitude: props.navigation.state.params.selectedLng,
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
        Global.selectedLat = this.state.selectedLat;
        Global.selectedLng = this.state.selectedLng;
        this.props.navigation.navigate("SignUp");
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
                <ImageBackground style = {styles.background_view} resizeMode = {'stretch'} source = {require('../assets/images/bg_signup.png')}>
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
                        <TouchableOpacity style = {styles.button} onPress = {() => this.props.navigation.navigate("SignUp")}>
                            <Text style = {{color: '#000000', fontSize: 20, fontFamily: 'Lato-Regular', marginLeft: 5}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.button} onPress = {() => this.select_location()}>
                            <Text style = {{color: '#000000', fontSize: 20, fontFamily: 'Lato-Regular', marginLeft: 5}}>Select</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        // justifyContent: 'center',
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
        height: deviceHight * 0.6
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
