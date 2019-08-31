import React, {Fragment, Component} from 'react';
import {
    YellowBox,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Share,
  Platform,
  Alert
} from 'react-native';

import {getInset} from 'react-native-safe-area-view'
const base64 = require('base-64');
import { SkypeIndicator } from 'react-native-indicators';
import Global from '../utils/Global/Global';
import firebaseApp from "../utils/Global/firebaseConfig";

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 70;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

export default class ScoreFacotrs extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            diagnose_list: [],
            prev_screen: props.navigation.state.params.prev_screen,
		}
    }

    async UNSAFE_componentWillMount() {
        // let dbRef = firebaseApp.database().ref('users');
        // await dbRef.on('child_added', async(val) => {
        //     let user = val.val();
        //     if(user.name != Global.user_name) {
        //         this.setState({
        //             diagnose_list: [...this.state.diagnose_list, user.name]
        //         })
        //     }
        // });
    }

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_contacts.bind(this));
    }

    init_contacts = async() => {
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/diagnose/' + Global.user_name, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            }
        })
        .then(response => response.json())
        .then(async data => {
            var diagnose_list = [{
                "diagnoseDesc": "EpatientIndex",
                "diagnoseCode": "EpatientIndex",
            }];
            diagnose_list.push(...data);
            this.setState({
                diagnose_list: diagnose_list
            })
        })
        .catch(function(error) {
            Alert.alert('Warning!', error.message);
        });
        this.setState({showIndicator: false})
    }

    go_home() {
        if(this.state.prev_screen == "patient") {
            this.props.navigation.navigate("Home");
        } else {
            this.props.navigation.navigate("AdvocateHome");
        }
    }

    render() {
        if(this.state.showIndicator)
        {
            return (
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 100}}>
                <View style = {{flex: 1}}>
                    <SkypeIndicator color = '#ffffff' />
                </View>
            </View>
            )
        }
        return (
            
        <SafeAreaView style = {styles.container}>
        {
            this.state.showIndicator &&
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 100}}>
                <View style = {{flex: 1}}>
                    <SkypeIndicator color = '#ffffff' />
                </View>
            </View>
        }
            <View style = {styles.menu_bar}>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.go_home()}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '60%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>EpatientIndex</Text>
                </View>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.go_home()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../assets/images/right_home.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '95%', height: main_view_height}}>
                <ScrollView style = {{width: '100%'}}>
                {
                    this.state.diagnose_list.map((item, index) => 
                    <TouchableOpacity key = {index} style = {styles.user_item_style} onPress = {() => this.props.navigation.navigate("ChatScreen", {disease: item})}>
                        <Text style = {styles.user_name_text} numberOfLines = {1} renderTruncatedFooter = {() => null}>{item.diagnoseDesc}</Text>
                    </TouchableOpacity>
                    )
                }
                </ScrollView>
            </View>
            
        </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        alignItems: 'center'
    },
    menu_bar: {
        width: '100%',
        height: menu_bar_height,
        backgroundColor: '#445774',
        flexDirection: 'row'
    },
    user_item_style: {
        width: '100%',
        height: 50,
        // borderColor: '#c0c0c0',
        // borderWidth: 1,
        justifyContent: 'center',
        marginTop: 10,
        // borderRadius: 5,
        paddingLeft: 10
    },
    user_name_text: {
        fontSize: 20,
        color: '#000000'
    }
})