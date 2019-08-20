import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Dimensions, Image, StatusBar, BackHandler, Alert} from 'react-native';
import {createStackNavigator, createAppContainer, createBottomTabNavigator} from "react-navigation"

import Splash from "./src/screens/Splash"
import SignIn from "./src/screens/SignIn";
import SignUp from "./src/screens/SignUp";
import LocationSelection from "./src/screens/LocationSelection";
import ForgotPassword from "./src/screens/ForgotPassword";

import Explore from "./src/screens/explore/Explore";
import SearchDiscount from "./src/screens/explore/SearchDiscount";
import DiscountDetail from "./src/screens/explore/DiscountDetail";

import Card from "./src/screens/card/Card";
import SearchCard from "./src/screens/card/SearchCard";
import CardDetail from "./src/screens/card/CardDetail";

import Saved from "./src/screens/saved/Saved";

import Alerts from "./src/screens/alert/Alerts";
import NotificationDetail from "./src/screens/alert/NotificationDetail";

import Myprofile from "./src/screens/myprofile/Myprofile";
import Setting from "./src/screens/myprofile/Setting";
import ResetPassword from "./src/screens/myprofile/ResetPassword";
import AccountLocation from "./src/screens/myprofile/AccountLocation";
import Myaccount from "./src/screens/myprofile/Myaccount";
import HelpSupport from "./src/screens/myprofile/HelpSupport";


var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var topviewHeight = Platform.OS == 'android' ? 60 - StatusBar.currentHeight : 60;
var tabbarHeight = 50


const ExplorNav = createStackNavigator ({
    Explore: {screen: Explore},
    SearchDiscount: {screen: SearchDiscount},
    DiscountDetail: {screen: DiscountDetail},
},
{
    // initialRouteName: 'Explore',
    navigationOptions: {
        header: null,
        headerBackTitle: null,
        tabBarIcon: ({focused, tintColor}) => (
            focused ? <Image style={{ width: '100%', height: '60%' }} resizeMode = {'contain'} source={require('./src/assets/images/ic_search_red.png')} /> : 
                <Image style={{ width: '100%', height: '60%' }} resizeMode = {'contain'} source={require('./src/assets/images/ic_search.png')} />
        ), 
        tabBarOptions: {
            activeTintColor: '#ff0000',
            style: {
                width: deviceWidth,
                height: tabbarHeight
            }
        },
        title: 'Explore'
    }
})

const CardNav = createStackNavigator ({
    Card: {screen: Card},
    SearchCard: {screen: SearchCard},
    CardDetail: {screen: CardDetail},
},
{
    navigationOptions: {
        header: null,
        headerBackTitle: null,
        tabBarIcon: ({focused, tintColor}) => (
            focused ? <Image style={{ width: '100%', height: '60%' }} resizeMode = {'contain'} source={require('./src/assets/images/ic_card_red.png')} /> :
            <Image style={{ width: '100%', height: '60%' }} resizeMode = {'contain'} source={require('./src/assets/images/ic_card.png')} />
        ), 
        tabBarOptions: {
            activeTintColor: '#ff0000',
            tabBarSelectedButtonColor: '#ff0000',
            style: {
                width: deviceWidth,
                height: tabbarHeight
            }
        },
        title: 'Card'
    }
})

const SavedNav = createStackNavigator ({
    Saved: {screen: Saved},

},
{
    navigationOptions: {
        header: null,
        headerBackTitle: null,
        tabBarIcon: ({focused, tintColor}) => (
            focused ? <Image style={{ width: '100%', height: '60%' }} resizeMode = {'contain'} source={require('./src/assets/images/ic_like_red.png')} /> : 
                <Image style={{ width: '100%', height: '60%' }} resizeMode = {'contain'} source={require('./src/assets/images/ic_like.png')} />
        ), 
        tabBarOptions: {
            activeTintColor: '#ff0000',
            style: {
                width: deviceWidth,
                height: tabbarHeight
            }
        },
        title: 'Saved'
    }
})

const AlertNav = createStackNavigator ({
    Alerts: {screen: Alerts},
    NotificationDetail: {screen: NotificationDetail}
},
{
    navigationOptions: {
        header: null,
        headerBackTitle: null,
        tabBarIcon: ({focused, tintColor}) => (
            focused ? <Image style={{ width: '100%', height: '60%' }} resizeMode = {'contain'} source={require('./src/assets/images/ic_alert_red.png')} /> : 
                <Image style={{ width: '100%', height: '60%' }} resizeMode = {'contain'} source={require('./src/assets/images/ic_alert.png')} />
        ), 
        tabBarOptions: {
            activeTintColor: '#ff0000',
            style: {
                width: deviceWidth,
                height: tabbarHeight
            }
        },
        title: 'Alerts'
    }
})

const MyProfiletNav = createStackNavigator ({
    Myprofile: {screen: Myprofile},
    Setting: {screen: Setting},
    ResetPassword: {screen: ResetPassword},
    AccountLocation: {screen: AccountLocation},
    Myaccount: {screen: Myaccount},
    HelpSupport: {screen: HelpSupport}
},
{
    navigationOptions: {
        header: null,
        headerBackTitle: null,
        tabBarIcon: ({focused, tintColor}) => (
            focused ? <Image style={{ width: '100%', height: '60%' }} resizeMode = {'contain'} source={require('./src/assets/images/ic_user_red.png')} /> :
                <Image style={{ width: '100%', height: '60%' }} resizeMode = {'contain'} source={require('./src/assets/images/ic_user.png')} />
        ), 
        tabBarOptions: {
            activeTintColor: '#ff0000',
            style: {
                width: deviceWidth,
                height: tabbarHeight
            }
        },
        title: 'My Profile'
    }
})

const TabNav = createBottomTabNavigator({
    ExplorStatck: {screen: ExplorNav},
    CardStack: {screen: CardNav},
    SavedNav: {screen: SavedNav},
    AlertStack: {screen: AlertNav},
    MyprofileStack: {screen: MyProfiletNav},
    
},
{
    // initialRouteName: 'ExplorStatck'
})

const AppNavigator = createStackNavigator ({
    Splash: {screen: Splash},
    SignIn: {screen: SignIn},
    SignUp: {screen: SignUp},
    LocationSelection: {screen: LocationSelection},
    ForgotPassword: {screen: ForgotPassword},
    // ConfirmForgotPassword: {screen: ConfirmForgotPassword},
    // CreateTeam: {screen: CreateTeam},
    // NewClub: {screen: NewClub},
    Main: {
        screen: TabNav,
        navigationOptions: {
            header: null,
        },
    },
});
  
const AppNav = createAppContainer(AppNavigator);

// export default AppNav;

function getActiveRouteName(navigationState) {
    if (!navigationState) {
      return null;
    }
    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    // console.warn(route);
    if (route.routes) {
      return getActiveRouteName(route);
    }
    return route.routeName;
} 

export default class App extends Component {

    constructor(props) {
        super(props);
        
        
    }

    componentDidMount() {
        this.backButtonListener = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        
    };

    handleBackButton = () => {

        Alert.alert('Notice!', 'Do you really want to exit?',
            [
                {text: 'Cancel', onPress: null},
                {text: 'Ok', onPress: () => BackHandler.exitApp()}
            ],
            { cancelable: true }
        );
            return true;
    };

    render() {
        return(
            <AppNav
                onNavigationStateChange={(prevState, currentState) => {
                    const currentScreen = getActiveRouteName(currentState);
                    if((currentScreen == 'Explore' || currentScreen == 'SignIn')) {
                        this.backButtonListener = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
                        
                    } else {
                        this.backButtonListener.remove();
                    }
                    // console.warn(currentScreen);
                }}
            />
        )
    }
}