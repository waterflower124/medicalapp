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
    Alert,
    Animated,
} from 'react-native';

import {getInset} from 'react-native-safe-area-view'

const base64 = require('base-64');
import { SkypeIndicator } from 'react-native-indicators';
import Global from '../utils/Global/Global';
import AsyncStorage from '@react-native-community/async-storage';

YellowBox.ignoreWarnings(["Warning:"]);

const topOffset = getInset('top');
var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 70;
var top_view_height = 130;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var group_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height - top_view_height : safearea_height - menu_bar_height - top_view_height - StatusBar.currentHeight;
var item_width = deviceWidth * 0.9 * 0.3;

export default class Home extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {
            showIndicator: false,

            item_array: [],
            final_score: 0,
            header_url: '',
            header_text: '',
            show_rightmenu: false,

            side_menu_show: false,

            coord_x: new Animated.Value(0)
        }
        
    }

    async UNSAFE_componentWillMount() {
    }


    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_dashboard.bind(this));
    }

 
    init_dashboard = async() => {
        this.setState({
            show_rightmenu: false
        })
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/signup/adv/' + Global.user_name, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            }
        })
        .then(response => response.json())
        .then(async data => {
            this.setState({
                item_array: data
            })
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Netework error");
        });
        this.setState({showIndicator: false})
    }

    my_account() {
        Global.update_account = true;
        if(Global.user_type == "advocate") {
            this.props.navigation.navigate("AdvocateSignup");
        } else {
            this.props.navigation.navigate("WorkerSignup");
        }
    }

    contactus() {
        this.setState({
            show_rightmenu: false
        });
        Alert.alert("www.epatientindex.com", "Please email to support@epatientindex.com.",
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: async() => {
                Linking.openURL('mailto:support@epatientindex.com');
            }}
        ],
        { cancelable: true })
    }

    terms_show() {
        this.setState({
            show_rightmenu: false,
            terms_modal_show: true
        })
    }

    logout = async() => {
        this.setState({
            show_rightmenu: false
        })
        Alert.alert("Logout", "Do you really want to log out?",
        [
            {text: 'Cancel', onPress: null},
            {text: 'OK', onPress: async() => {
                await AsyncStorage.setItem("signin_status", "false");
                this.props.navigation.navigate("Login");
            }}
        ],
        { cancelable: true })
    }

    animate_side_menu(target_screen) {
        
        var toValue = deviceWidth * 0.8;
        if(this.state.side_menu_show) {
            toValue = -deviceWidth * 0.8;
        };
        this.setState({
            side_menu_show: !this.state.side_menu_show
        })
        Animated.timing(
            this.state.coord_x,
            {
                toValue: toValue,
                velocity: 3,
                tension: 2,
                friction: 8,
            }
        ).start();
        if(target_screen == "Icd 10 Admin") {
            if(Global.mother == "Y") {
                Global.icd_admin_json = {
                    "diagnoseAlias": "",
                    "diagnoseCode": "",
                    "diagnoseDesc": "",
                    "diagnoseIcd9": "",
                    "errorMargin": 0,
                    "hereditary": "N",
                    "id": 0,
                    "confuses": [],
                    "labs": [],
                    "notes": [],
                    "symptoms": []
                };
                this.props.navigation.navigate("ICDCode");
            } else {
                Alert.alert("EpatientIndex", "Only certified users have access to admin modules. If you are interested in collaborating please send email to nerysrosa2003@gmail.com.")
            }
        } else if(target_screen == "Lab Admin") {
            if(Global.mother == "Y") {
                Global.lab_admin_json = {
                    "bestAlias":"",
                    "id":0,
                    "labAlias":"",
                    "labCode":"",
                    "labDesc":"",
                    "loincCode":"",
                    "userName":""
                };
                this.props.navigation.navigate("LabMaster");
            } else {
                Alert.alert("EpatientIndex", "Only certified users have access to admin modules. If you are interested in collaborating please send email to nerysrosa2003@gmail.com.")
            }
        } else if(target_screen == "Symptom Admin") {
            if(Global.mother == "Y") {
                Global.symptom_admin_json = {
                    "id": 0,
                    "symptomAlias": "",
                    "symptomCode": "",
                    "symptomDesc": ""
                };
                this.props.navigation.navigate("SymptomMaster");
            } else {
                Alert.alert("EpatientIndex", "Only certified users have access to admin modules. If you are interested in collaborating please send email to nerysrosa2003@gmail.com.")
            }
        } else if(target_screen == "Cpt Admin") {
            if(Global.mother == "Y") {
                Global.cpt_admin_json = {
                    "id": 0,
                    "medproc": {
                        "estado": "",
                        "id": 0,
                        "procAlias": "",
                        "procCode": "",
                        "procDesc": "",
                        "riskFactor": "",
                        "successRate": 0
                    },
                    "surgeryAlt": [],
                    "surgeryInst": [],
                    "surgeryRisk": []
                };
                this.props.navigation.navigate("CptMaster");
            } else {
                Alert.alert("EpatientIndex", "Only certified users have access to admin modules. If you are interested in collaborating please send email to nerysrosa2003@gmail.com.")
            }
        } 
    }

    chat_function() {
        // Alert.alert("EpatientIndex", "You can't use chat function. Please contact us.",
        // [
        //     {text: 'OK', onPress: null}
        // ],
        // { cancelable: true });
        this.props.navigation.navigate("ChatContacts", {prev_screen: 'advocate'});
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
            this.state.side_menu_show &&
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'black', opacity: 0.3, zIndex: 100}} onStartShouldSetResponder={() => this.animate_side_menu()}/>
        }
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
                        <TouchableOpacity style = {{marginRight: 20}} onPress = {() => this.setState({terms_modal_show: false})}>
                            <Text style = {styles.button_text}>AGREE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        }

            <Animated.View style = {[styles.side_menu_view, {transform: [{translateX: this.state.coord_x}]}]}>
                <View style = {styles.side_menu_top_view}>
                    <View style = {styles.side_menu_logo_view}>
                        <Image style = {{height: '70%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/logo.png')}/>
                    </View>
                    <View style = {styles.side_menu_name_view}>
                        <Text style = {styles.side_menu_name_text}>{Global.user_name}</Text>
                    </View>
                </View>
                <TouchableOpacity style = {styles.side_menu_component_view} onPress = {() => this.animate_side_menu("Home")}>
                    <View style = {styles.side_menu_item_icon_view}>
                        <Image style = {{height: '50%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/side_menu_home.png')}/>
                    </View>
                    <View style = {styles.side_menu_item_text_view}>
                        <Text style = {styles.side_menu_item_text}>Home</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.side_menu_component_view} onPress = {() => this.animate_side_menu("Icd 10 Admin")}>
                    <View style = {styles.side_menu_item_icon_view}>
                        <Image style = {{height: '50%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/side_menu_icdadmin.png')}/>
                    </View>
                    <View style = {styles.side_menu_item_text_view}>
                        <Text style = {styles.side_menu_item_text}>Icd 10 Admin</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.side_menu_component_view} onPress = {() => this.animate_side_menu("Lab Admin")}>
                    <View style = {styles.side_menu_item_icon_view}>
                        <Image style = {{height: '50%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/side_menu_labadmin.png')}/>
                    </View>
                    <View style = {styles.side_menu_item_text_view}>
                        <Text style = {styles.side_menu_item_text}>Lab Admin</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.side_menu_component_view} onPress = {() => this.animate_side_menu("Symptom Admin")}>
                    <View style = {styles.side_menu_item_icon_view}>
                        <Image style = {{height: '50%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/side_menu_symptomadmin.png')}/>
                    </View>
                    <View style = {styles.side_menu_item_text_view}>
                        <Text style = {styles.side_menu_item_text}>Symptom Admin</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.side_menu_component_view} onPress = {() => this.animate_side_menu("Cpt Admin")}>
                    <View style = {styles.side_menu_item_icon_view}>
                        <Image style = {{height: '50%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/side_menu_cptadmin.png')}/>
                    </View>
                    <View style = {styles.side_menu_item_text_view}>
                        <Text style = {styles.side_menu_item_text}>Cpt Admin</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>


            <View style = {styles.menu_bar}>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.animate_side_menu()}>
                        <Image style = {{width: 25, height: 25}} resizeMode = {'contain'} source={require('../assets/images/menu_left.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '65%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>EpatientIndex</Text>
                </View>
                <View style = {{width: '15%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => {this.setState({show_rightmenu: !this.state.show_rightmenu})}}>
                        <Image style = {{width: 25, height: 25}} resizeMode = {'contain'} source={require('../assets/images/menu_right.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
        {
            this.state.show_rightmenu &&
            <View style = {{width: deviceWidth, height: deviceHeight, left: 0, right: 0, position: 'absolute', zIndex: 10}} onStartShouldSetResponder={() => this.setState({show_rightmenu: false})}/>
        }
        {
            this.state.show_rightmenu &&
            <View style = {styles.right_menu_view}>
                <TouchableOpacity style = {styles.menu_item_view} onPress = {() => this.my_account()}>
                    <Text style = {styles.menu_text}>My Account</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.menu_item_view} onPress = {() => this.contactus()}>
                    <Text style = {styles.menu_text}>Contact Us</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.menu_item_view} onPress = {() => this.terms_show()}>
                    <Text style = {styles.menu_text}>Disclaimer</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.menu_item_view} onPress = {() => this.logout()}>
                    <Text style = {styles.menu_text}>Log out</Text>
                </TouchableOpacity>
            </View>
        }
            <View style = {{width: '100%', height: top_view_height, alignItems: 'center', padding: 5}}>
                <View style = {{width: '100%', height: '100%', flexDirection: 'row', backgroundColor: '#ffffff', borderColor: '#c0c0c0', borderWidth: 1}}>
                    <View style = {{width: '40%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <Image style = {{height: '80%', aspectRatio: 1}} resizeMode = {'contain'} source={require('../assets/images/score725.png')}/>
                    </View>
                    <View style = {{width: '40%', height: '100%', justifyContent: 'center'}}>
                        <Text style = {{fontSize: 16, color: '#ff0000', marginBottom: 5}}>Advocate</Text>
                        <Text style = {{fontSize: 14, fontWeight: 'bold', color: '#000000', marginBottom: 5}}>e-Patient Index</Text>
                        <Text style = {{fontSize: 12, color: '#ff0000'}}>Lock at your Patient records</Text>
                    </View>
                    <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        {/* <Text style = {{fontSize: 24, fontWeight: 'bold', color: '#3aa1f4'}}>{this.state.final_score}</Text> */}
                    </View>
                </View>
            </View>
            <View style = {{width: '100%', height: group_view_height, alignItems: 'center', justifyContent: 'center'}}>
                <View style = {{width: deviceWidth * 0.9, height: deviceWidth * 0.9, justifyContent: 'space-between'}}>
                    <View style = {{width: '100%', height: '30%', justifyContent: 'space-between', flexDirection: 'row'}}>
                    <TouchableOpacity style = {styles.item_style} onPress = {() => this.props.navigation.navigate("MyPatient", {patient_list: this.state.item_array})}>
                        {
                            this.state.item_array.length != 0 &&
                            <View style = {styles.badge_view}>
                                <Text style = {styles.badge_text}>{this.state.item_array.length}</Text>
                            </View>
                        }
                            <Image style = {styles.item_icon} resizeMode = {'contain'} source={require('../assets/images/main_heart.png')}/>
                            <Text style = {styles.item_text}>My Patients</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.item_style} onPress = {() => this.chat_function()}>
                            <Image style = {styles.item_icon} resizeMode = {'contain'} source={require('../assets/images/main_chat.png')}/>
                            <Text style = {styles.item_text}>Chat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {styles.item_style} onPress = {() => this.props.navigation.navigate("Advice", {prev_screen: 'advocate'})}>
                            <Image style = {styles.item_icon} resizeMode = {'contain'} source={require('../assets/images/main_advice.png')}/>
                            <Text style = {styles.item_text}>Advice</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {{width: '100%', height: '30%', justifyContent: 'space-between', flexDirection: 'row'}}>
                        
                    </View>
                    <View style = {{width: '100%', height: '30%', justifyContent: 'space-between', flexDirection: 'row'}}>
                        
                    </View>
                </View>
            </View>
        </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        // alignItems: 'center'
    },
    menu_bar: {
        width: '100%',
        height: menu_bar_height,
        backgroundColor: '#445774',
        flexDirection: 'row'
    },
    item_style: {
        width: '30%', 
        height: '100%', 
        borderWidth: 1, 
        borderColor: '#000000', 
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    item_icon: {
        width: '50%',
        height: '50%'
    },
    item_text: {
        fontSize: 12,
        color: '#000000'
    },
    badge_view: {
        width: 20,
        height: 20,
        top: 5,
        right: 5,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#ff0000'
    },
    badge_text: {
        fontSize: 10,
        color: '#ffffff'
    },
    right_menu_view: {
        width: 200,
        height: 200,
        position: 'absolute',
        top: menu_bar_height + topOffset,
        right: 5,
        backgroundColor: '#fafafa',
        zIndex: 10,
        borderColor: '#808080',
        borderWidth: 1
    },
    menu_item_view: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        paddingLeft: 5
    },
    menu_text: {
        fontSize: 16,
        color: '#000000'
    },

    side_menu_view: {
        width: deviceWidth * 0.8,
        height: safearea_height,
        position: 'absolute',
        left: -deviceWidth * 0.8,
        top: topOffset,
        backgroundColor: '#ffffff',
        zIndex: 200
    },
    side_menu_top_view: {
        width: '100%',
        height: 200,
        backgroundColor: '#455774'
    },
    side_menu_logo_view: {
        width: '100%',
        height: '70%',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    side_menu_name_view: {
        width: '100%',
        height: '30%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    side_menu_name_text: {
        fontSize: 20,
        color: '#ffffff'
    },
    side_menu_component_view: {
        width: '100%',
        height: 50,
        flexDirection: 'row'
    },
    side_menu_item_icon_view: {
        width: '20%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    side_menu_item_text_view: {
        width: '70%',
        height: '100%',
        justifyContent: 'center',
        paddingLeft: 20
    },
    side_menu_item_text: {
        fontSize: 16,
        color: '#000000'
    },
})