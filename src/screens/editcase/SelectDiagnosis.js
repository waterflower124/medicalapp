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
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';

import {getInset} from 'react-native-safe-area-view'
const base64 = require('base-64');
import { SkypeIndicator } from 'react-native-indicators';
import Global from '../../utils/Global/Global'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from 'moment';
import { isTSExpressionWithTypeArguments } from '@babel/types';

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 70;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

export default class SelectDiagnosis extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            prev_screen: props.navigation.state.params.prev_screen,
            diagnosis_list: [],

            search_text: '',
            new_diagnosis_modal_show: false,
            diagnosis_name: '',
            diagnosis_code: '',
            
            
		}
    }

    async UNSAFE_componentWillMount() {
        
    }

    go_back() {
        if(this.state.prev_screen == "EditDiagnosis") {
            this.props.navigation.navigate("EditDiagnosis");
        } else if(this.state.prev_screen == "ICDCode") {
            this.props.navigation.navigate("ICDCode");
        } else if(this.state.prev_screen == "DifferentialDiagnosis") {
            this.props.navigation.navigate("DifferentialDiagnosis");
        }
    }

    async select_diagnosis(item) {
        if(this.state.prev_screen == "EditDiagnosis") {
            Global.edit_case_json.diagnoses.push(item);
            this.props.navigation.navigate("EditDiagnosis");
        } else if(this.state.prev_screen == "ICDCode") {
            Global.icd_admin_json.diagnoseDesc = item.diagnoseDesc;
            Global.icd_admin_json.diagnoseCode = item.diagnoseCode;
            Global.icd_admin_json.diagnoseIcd9 = item.diagnoseIcd9;
            Global.icd_admin_json.diagnoseAlias = item.diagnoseAlias;
            Global.icd_admin_json.errorMargin = item.errorMargin;
            Global.icd_admin_json.hereditary = item.hereditary;
            Global.icd_admin_json.id = item.id;

            this.setState({showIndicator: true})
            await fetch(Global.base_url + "/maindiag/" + item.id, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
                }
            })
            .then(response => response.json())
            .then(async data => {
                Global.icd_admin_json.confuses = data.confuses;
                Global.icd_admin_json.labs = data.diaglabs;
                // for(i = 0; i < Global.icd_admin_json.labs.length; i ++) {
                //     Global.icd_admin_json.labs[i].bestAlias = "";
                //     Global.icd_admin_json.labs[i].labAlias = "";
                //     Global.icd_admin_json.labs[i].userName = Global.user_name;
                //     Global.icd_admin_json.labs[i].visitNumber = 0;
                // }
                Global.icd_admin_json.notes = data.notes;
                Global.icd_admin_json.symptoms = data.diagsymptoms;
                // for(i = 0; i < Global.icd_admin_json.symptoms.length; i ++) {
                //     Global.icd_admin_json.symptoms[i].userName = Global.user_name;
                //     Global.icd_admin_json.symptoms[i].visitNumber = 0;
                // }
            })
            .catch(function(error) {
                Alert.alert('Warning!', error.message);
            });
            this.setState({showIndicator: false})

            this.props.navigation.navigate("ICDCode");
        } else if(this.state.prev_screen == "DifferentialDiagnosis") {
            var new_diag = {
                "diagnoseCode": item.diagnoseCode,
                "confuseDesc": item.diagnoseDesc,
                "confuseCode": ""
            }
            Global.icd_admin_json.confuses.push(new_diag);
            this.props.navigation.navigate("DifferentialDiagnosis");
        }
    }

    search_diagnosis = async() => {
        Keyboard.dismiss();
        if(this.state.search_text < 2) {
            Alert.alert("Warning!", "Minimum criteria length is 2 characters.");
            return;
        }
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/diagnoseref?query=' + this.state.search_text, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            }
        })
        .then(response => response.json())
        .then(async data => {
            this.setState({
                diagnosis_list: data,
            });
        })
        .catch(function(error) {
            Alert.alert('Warning!', error.message);
        });
        this.setState({showIndicator: false})

    }

    add_new_diagnose = async() => {
        if(this.state.diagnosis_name == "" || this.state.diagnosis_code == "") {
            Alert.alert("Warning!", "Please fill all fields.");
            return;
        }
        var new_diagnose = {
            "diagnoseDesc": this.state.diagnosis_name,
            "diagnoseCode": this.state.diagnosis_code
        };
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/diagnoseref', {
            method: "POST",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify(new_diagnose)
        })
        .then(response => {
            const status_code = response.status;
            if(status_code == 409) {
                return {'error': 409};
            } else {
                return data = response.json();
            } 
        })
        .then(async data => {
            if(data.error == 409) {
                Alert.alert("Warning!", "Symptom already exist.");
            } else {
                var diagnosis_list = this.state.diagnosis_list;
                new_diagnose.diagnoseCode = "x-" + new_diagnose.diagnoseCode;
                new_diagnose.id = -1;
                diagnosis_list.push(new_diagnose);
                this.setState({
                    diagnosis_list: diagnosis_list,
                    new_diagnosis_modal_show: false,
                    diagnosis_name: "",
                    diagnosis_code: ""
                })
            }
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Netework error");
        });
        this.setState({showIndicator: false})
    }

    render() {
        return (
        <SafeAreaView style = {styles.container}>
        {
            this.state.showIndicator &&
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 150}}>
                <View style = {{flex: 1}}>
                    <SkypeIndicator color = '#ffffff' />
                </View>
            </View>
        }
            <View style = {styles.menu_bar}>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.go_back()}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '80%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>Select Diagnosis</Text>
                </View>

            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}}>
                <View style = {{width: '95%', height: 40, borderColor: '#000000', borderWidth: 1, flexDirection: 'row', marginTop: 10}}>
                    <View style = {{width: '80%', height: '100%'}}>
                        <TextInput style = {styles.search_input_text} placeholder = {'Search Symptoms'} returnKeyType = {'search'} onSubmitEditing = {() => this.search_diagnosis()} onChangeText = {(text) => this.setState({search_text: text})}></TextInput>
                    </View>
                    <TouchableOpacity style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'flex-end'}} onPress = {() => this.search_diagnosis()}>
                        <Image style = {{width: 20, height: 20, marginRight: 10}} resizeMode = {'contain'} source={require('../../assets/images/search_icon.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '95%', height: main_view_height - 40 - 10}}>
                    <ScrollView style = {{width: '100%'}} showsVerticalScrollIndicator = {false}>
                    {
                        this.state.diagnosis_list.map((item, index) => 
                        <TouchableOpacity key = {index} style = {styles.component_view} onPress = {() => this.select_diagnosis(item)}>
                            <Text style = {styles.component_content_text}>{item.diagnoseDesc}({item.diagnoseCode})</Text>
                        </TouchableOpacity>
                        )
                    }
                    </ScrollView>
                </View>
                <TouchableOpacity style = {{width: 40, height: 40, position: 'absolute', right: 10, bottom: 10}} onPress = {() => this.setState({new_diagnosis_modal_show: true})}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source={require('../../assets/images/new_case_add.png')}/>
                </TouchableOpacity>
            </View>
            {
                this.state.new_diagnosis_modal_show &&
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 50}}/>
            }
            {
                this.state.new_diagnosis_modal_show &&
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100}}>
                    <View style = {{width: '80%', height: 300, alignItems: 'center', backgroundColor: '#ffffff'}}>
                        <View style = {{width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#445774'}}>
                            <Text style = {[styles.component_content_text, {color: '#ffffff'}]}>Create New Diagnosis</Text>
                        </View>
                        <View style = {{width: '100%', height: 30, justifyContent: 'center', marginLeft: 10}}>
                            <Text style = {styles.component_content_text}>Enter Diagnosis</Text>
                        </View>
                        <View style = {{width: '95%', height: 40, borderColor: '#000000', borderWidth: 1, justifyContent: 'center'}}>
                            <TextInput style = {[styles.component_content_text, {padding: 0}]} onChangeText = {(text) => this.setState({diagnosis_name: text})}>{this.state.diagnosis_name}</TextInput>
                        </View>
                        <View style = {{width: '100%', height: 30, justifyContent: 'center', marginLeft: 10}}>
                            <Text style = {styles.component_content_text}>Enter diagnosis(icd10) code</Text>
                        </View>
                        <View style = {{width: '95%', height: 40, borderColor: '#000000', borderWidth: 1, justifyContent: 'center'}}>
                            <TextInput style = {[styles.component_content_text, {padding: 0}]} onChangeText = {(text) => this.setState({diagnosis_code: text})}>{this.state.diagnosis_code}</TextInput>
                        </View>
                        <View style = {{width: '95%', height: 110, justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}}>
                            <TouchableOpacity style = {{width: '45%', height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#445774'}} onPress = {() => this.setState({new_diagnosis_modal_show: false})}>
                                <Text style = {[styles.component_content_text, {color: '#ffffff'}]}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {{width: '45%', height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#445774'}} onPress = {() => this.add_new_diagnose()}>
                                <Text style = {[styles.component_content_text, {color: '#ffffff'}]}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }
            
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
    search_input_text: {
        width: '100%',
        height: '100%',
        padding: 0,
        paddingLeft: 10
    },
    component_view: {
        width: '100%',
        // height: 40,
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        marginTop: 15
    },
    component_content_text: {
        fontSize: 16,
        color: '#000000'
    }
})