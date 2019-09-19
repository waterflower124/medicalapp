import React, {Fragment, Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  BackHandler,
  Alert
} from 'react-native';
import Global from '../utils/Global/Global';
import AsyncStorage from '@react-native-community/async-storage';
import { SkypeIndicator } from 'react-native-indicators';
const base64 = require('base-64');
import firebaseApp from "../utils/Global/firebaseConfig"

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var tabbarHeight = 50
var main_viewHeight = Platform.OS == 'android' ? deviceHeight - (tabbarHeight + 5) - StatusBar.currentHeight : deviceHeight - (tabbarHeight + 5);/// bottom tabbar height


export default class Splash extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {
            selected_tab: '',
            showIndicator: false,

            terms_modal_show: false
		}
    }

    async componentDidMount() {
        console.log("asdfghjkl");
        await fetch("https://epatientindex.herokuapp.com/version/1")
        .then(response => response.json())
        .then(async data => {
            Global.base_url = data.heroku;
            // console.warn(data.heroku)
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Netework error");
            return;
        });
        setTimeout(async() => {
            try {
                let signin_status = await AsyncStorage.getItem("signin_status");
                if(signin_status == "ok") {
                    let user_name = await AsyncStorage.getItem("user_name");
                    let password = await AsyncStorage.getItem("password");

                    this.setState({showIndicator: true})
                    await fetch(Global.base_url + '/login', {
                        method: 'GET',
                        headers: {
                            'Authorization': 'Basic ' + base64.encode(user_name + ":" + password)
                        }
                    })
                    .then(response => response.json())
                    .then(async data => {
                        if(data.error == "Unauthorized") {
                            Alert.alert('Warning!', "Username or Password is incorrect");
                            this.props.navigation.navigate("Login");
                        } else {
                            Global.profile_user_name = user_name;
                            Global.user_name = user_name;
                            Global.password = password;
                            Global.userCode = data.userCode;
                            Global.mother = data.mother;
                            Global.advocate_userid = data.father;
                            Global.signup_id = data.id;
                            
                            Global.father = data.father;
                            Global.email = data.email;
                            Global.paarea = data.paarea;
                            Global.padesc = data.padesc;
                            Global.paname = data.paname;
                            Global.phone = data.phone;
                            Global.paorg = data.paorg;

                            await firebaseApp.auth().signInAnonymously()
                            .then(async() => {
                                Global.firebase_id = firebaseApp.auth().currentUser.uid;
                                // console.warn("firebase success")
                            })
                            .catch((error) => {
                                // console.warn(error)
                            })


                            // await firebaseApp.database().ref("users/" + user_name).update({name: user_name})
                            // .then(async() => {
                            // }).catch((error) => {
                            //     Alert.alert('Warning!', "Network error.");
                            // })

                            if(data.paname != "") {
                                Global.user_type = "advocate";
                                this.props.navigation.navigate("AdvocateHome");
                            } else {
                                Global.user_type = "e-patient";
                                this.props.navigation.navigate("Home");
                            }
                        }
                    })
                    .catch(function(error) {
                        Alert.alert('Warning!', "Network error.");
                        this.props.navigation.navigate("Login");
                    });
                    this.setState({showIndicator: false})
                } else {
                    this.setState({
                        terms_modal_show: true
                    });
                }
            } catch(error) {

            }
        }, 1000);
    }

    exit_alert() {
        Alert.alert('Notice!', 'Are you sure exit app?',
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: () => BackHandler.exitApp()},
        ],
        { cancelable: true })
    }

    render() {
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
            <Image style = {{width: '50%', height: '50%'}} resizeMode = {'contain'} source={require('../assets/images/logo.png')}/>
        {
            this.state.terms_modal_show &&
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'black', opacity: 0.3, zIndex: 50}}/>
        }
        {
            this.state.terms_modal_show &&
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100}}>
                <View style = {{width: '90%', height: '90%', backgroundColor: '#ffffff'}}>
                    <View style = {{width: '100%', height: '90%', alignItems: 'center', paddingTop: 20}}>
                        <ScrollView style = {{width: '90%',}} showsVerticalScrollIndicator = {false}>
                            <Text style = {styles.terms_title_text} multiline = {true}>Terms of Use</Text>
                            <Text style = {styles.terms_content_text} multiline = {true}>
                                Notice to User: Please read the following Licensing Agreement/Terms and Conditions carefully because it will apply
                                to your access to and use of this Application, and constitute a legally binding agreement between you and
                                the developers of the EpatientIndex app. Clicking the "I Agree" button constitutes your acceptance to be bound by all the Terms
                                and Conditions of this Agreement. If you do not accept the terms of this Agreement, you will not be able to use the
                                Application. Please exit this window if you choose not to accept all of the terms and conditions.
                            </Text>
                            <Text style = {[styles.terms_title_text, {marginTop: 20}]} multiline = {true}>TERMS AND CONDITIONS</Text>
                            <Text style = {styles.terms_title_text} multiline = {true}>1. MEDICAL INFORMATIOM/CONDITIOMS</Text>
                            <Text style = {styles.terms_content_text} multiline = {true}>
                                The information provided in this application is not intended to be used
                                as a substitute for medical judgment, advice, diagnosis or treatment of any
                                health condition or problem.

                                EpatientIndex is a not substitute for a doctor, it does not provide diagnosis and does not create
                                any physician-patient relationship. EpatientIndex information should not be your trusted source of
                                information regarding your health care.

                                THIS APPLICATION HAS NOT BEEN EVALUDATED BY THE FOOD AND DRUG ADMINISTRATION OR ANY REGULATORY AUTHORITY.

                                We are not responsible for any harm or damage the use of the information contained in this
                                software can cause you, if you have the terrible idea to use it as an alternative for
                                the advice of a doctor.
                            </Text>
                            <Text style = {[styles.terms_title_text, {marginTop: 20}]} multiline = {true}>2. DISCLAIMER AND NOTICE</Text>
                            <Text style = {styles.terms_content_text} multiline = {true}>
                                This Application may contain, use or present information derived from third party sources.
                                While care has been taken to confirm the accuracy of the information presented based on
                                the sources used. EpatientIndex developers make no warranty expressed or implied, with respect to the accuracy
                                of the contents of the Application.
                                Health-related information changes frequently and therefore information contained in EpatientIndex application
                                    might be outdated, incomplete or incorrect. EpatientIndex developers are not responsible if any outdated or incorrect information
                                    provided in this application is used by you without a valid confirmation from your doctor or trusted accurate source.
                            </Text>
                            <Text style = {[styles.terms_title_text, {marginTop: 20}]} multiline = {true}>3. CONSENT TO USE OF DATA</Text>
                            <Text style = {styles.terms_content_text} multiline = {true}>
                                We do not save your name or phone number. We do not save your address. We do not save your email address. We do not save any information that may identify you.
                                We do not attach your health information to name,address,emailAddress,phone or social security.
                                We reserve the right to use the information you populate for educational purpose only for the benefit of the epatientindex community.
                                All data entered in epatientindex database can be agregated to provide statistic to other users.
                                Examples: % of time a disease was wrong, % of time a disease required treatment,% of time patients read their records.
                                You give epatientindex permission to combine in every possible way all the non-identifiable information you enter for the services with that of other users of epatientIndex.
                            </Text>
                            <Text style = {[styles.terms_title_text, {marginTop: 20}]} multiline = {true}>4. DISCLAIMER OF WARRANTIES</Text>
                            <Text style = {styles.terms_content_text} multiline = {true}>
                                YOU UNDERSTAND AND AGREE THAT THE APPLICATION IS PROVIDED ON "AS IS" AND "AS AVAILABLE". EpatientIndex DEVELOPERS CAN MAKE
                                CHANGES AT ANY TIME AND WE MAKE NO WARRANTY THAT APPLICATION WILL ALWAYS BE AVAILABLE OR ERROR FREE. The use of the app is free but we reserve the right to request a fee
                                for the use of the app.
                            </Text>
                            <Text style = {[styles.terms_title_text, {marginTop: 20}]} multiline = {true}>5. INTERNET ACCESS</Text>
                            <Text style = {styles.terms_content_text} multiline = {true}>
                                Use of these Services may be available through a compatible mobile device, Internet and/or network access and may require software. You
                                agree that you are solely responsible for these requirements.
                            </Text>
                            <Text style = {[styles.terms_title_text, {marginTop: 20}]} multiline = {true}>6. Use of WWW.REXORPING.COM</Text>
                            <Text style = {styles.terms_title_text} multiline = {true}>
                                You recognize that there will be no liability for anybody sending/receiving icd codes using www.recordping.com and www.epatientindex.com have not liability
                                for the use or mis-use of www.recordping.com. You recognize and accept that there can be mistakes or omissions in getting your icd codes from www.recordping.com
                                and you are using that option at your own risk.
                            </Text>
                            <Text style = {[styles.terms_title_text, {marginTop: 20}]} multiline = {true}>7. CUSTOMER AGREEMENTS</Text>
                            <Text style = {styles.terms_title_text} multiline = {true}>
                                You hereby represent that you are legally bound by this Agreement when you download, install and use this Application.
                            </Text>
                        </ScrollView>
                    </View>
                    <View style = {{width: '100%', height: 1, backgroundColor: '#d0d0d0'}}/>
                    <View style = {{width: '100%', height: '10%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
                        <TouchableOpacity style = {{marginRight: 20}} onPress = {() => this.exit_alert()}>
                            <Text style = {styles.button_text}>DISAGREE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {{marginRight: 20}} onPress = {() => this.props.navigation.navigate("Login")}>
                            <Text style = {styles.button_text}>AGREE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        }
        </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    button_text: {
        fontSize: 16,
        color: '#f79952'
    },
    terms_title_text: {
        fontSize: 16,
        color: '#000000',
        fontWeight: 'bold'
    },
    terms_content_text: {
        fontSize: 16,
        color: '#000000',
    }
})