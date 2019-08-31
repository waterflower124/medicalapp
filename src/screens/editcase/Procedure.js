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
  TouchableWithoutFeedback
} from 'react-native';

import {getInset} from 'react-native-safe-area-view'
const base64 = require('base-64');
import { SkypeIndicator } from 'react-native-indicators';
import Global from '../../utils/Global/Global'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from 'moment';

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 70;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var tab_view_height = 50;
var top_tab_view_height = 40;
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height - tab_view_height - top_tab_view_height : safearea_height - menu_bar_height - tab_view_height - top_tab_view_height - StatusBar.currentHeight;

export default class Procedure extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            edit_case_json: null,
            visitStatus: '',
            page_title: '',

            selected_top_tab: '',

            isDateTimePickerVisible: false,
            procDate_string: '',
            procName: '',
            procCode: '',
            procAlias: '',
            successRate: null,

            procComments: '',

		}
    }

    async UNSAFE_componentWillMount() {
        
    }

    componentDidMount() {
        this.props.navigation.addListener('willFocus', this.init_visit.bind(this));
    }

    init_visit = () => {
        this.setState({
            edit_case_json: Global.edit_case_json,
            visitStatus: Global.visitStatus,
            page_title: Global.editcase_page_title,
            selected_top_tab: Global.procedure_selected_top_tab,

            procDate_string: Global.edit_case_json.procDate,
            procName: Global.edit_case_json.procName,
            procCode: Global.edit_case_json.procCode,
            procAlias: Global.edit_case_json.procAlias,
            successRate: Global.edit_case_json.successRate,
            procComments: Global.edit_case_json.procComments,
        })
    }

    select_tab = (item) => {

        Global.editcase_page_title = item;
        if(item == "Visit Master") {
            this.props.navigation.navigate("VisitMaster");
        } else if(item == "Symptoms") {
            this.props.navigation.navigate("Symptoms");
        } else if(item == "Diagnosis") {
            this.props.navigation.navigate("EditDiagnosis");
        } else if(item == "Prescription") {
            this.props.navigation.navigate("Prescription");
        } else if(item == "Lab tests") {
            this.props.navigation.navigate("LabTests");
        } else if(item == "Procedure") {
            this.props.navigation.navigate("Procedure");
        } else if(item == "Referal") {
            this.props.navigation.navigate("Referal");
        }
        Global.procedure_selected_top_tab = "Procedure";
    }

    go_back() {
        Alert.alert('Notice!', 'Any changes will be lost, do you want to abort?',
        [
            {text: 'No', onPress: null},
            {text: 'Yes', onPress: () => {
                Global.editcase_page_title = "Visit Master";
                Global.procedure_selected_top_tab = "Procedure";
                this.props.navigation.navigate("PendingVisit");
            }},
        ],
        { cancelable: true })
    }

    select_top_tab(item) {
        Global.procedure_selected_top_tab = item;
        if(item == "Procedure") {
            this.props.navigation.navigate("Procedure");
        } else if(item == "Risks") {
            this.props.navigation.navigate("Risks");
        } else if(item == "Alternatives") {
            this.props.navigation.navigate("Alternatives");
        } else if(item == "Post-OP") {
            this.props.navigation.navigate("PostOP");
        } else if(item == "Treats") {
            this.props.navigation.navigate("Treats");
        }
    }

    showDateTimePicker = () => {
        if(this.state.procDate_string == "") {
            this.setState({
                showDate: new Date()
            })
        } else {
            this.setState({
                showDate: new Date(this.state.procDate_string)
            })
        }
        this.setState({ 
            isDateTimePickerVisible: true 
        });
    };

    hideDateTimePicker = () => {
        this.setState({ isDateTimePickerVisible: false });
    };

    handleDatePicked = date => {
        this.setState({
            procDate_string: moment(date).format("MMMM DD YYYY")
        });
        Global.edit_case_json.procDate = moment(date).format("MMMM DD YYYY");
        
        this.hideDateTimePicker();
    };

    set_comments(text) {
        this.setState({
            procComments: text
        })
        Global.edit_case_json.procComments = text;
    }

    erase_case() {
        this.setState({
            procDate_string: "",
            procName: "",
            procCode: "",
            procAlias: "",
            successRate: "0",
            procComments: "",
        });
        Global.edit_case_json.procDate = "";
        Global.edit_case_json.procName = "";
        Global.edit_case_json.procCode = "";
        Global.edit_case_json.procAlias = "";
        Global.edit_case_json.successRate = "0";
        Global.edit_case_json.procComments = "";
        Global.edit_case_json.alternatives = [];
        Global.edit_case_json.instructions = [];
        Global.edit_case_json.risks = [];
        Global.edit_case_json.prodiags = [];
    }

    save_case = async() => {
        if(Global.edit_case_json.visitDate == "" || Global.edit_case_json.visitDate == null || 
            Global.edit_case_json.hospitalName == "" || Global.edit_case_json.hospitalName == null 
            || Global.edit_case_json.doctorName == "" || Global.edit_case_json.doctorName == null) {
            Alert.alert("Warning!", "You have to input Visit Date, Hospital Name and Doctor Name.");
            return;
        }
        this.setState({showIndicator: true});
        await fetch(Global.base_url + '/visitproxy', {
            method: "POST",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify(Global.edit_case_json)
        })
        .then(response => {
            return response.json();
        })
        .then(async data => {
            Global.editcase_page_title = "Visit Master";
            Global.procedure_selected_top_tab = "Procedure";
            this.props.navigation.navigate("PendingVisit");
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Netework error");
        });
        this.setState({showIndicator: false});
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
            <View style = {styles.menu_bar}>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.go_back()}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '40%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>{this.state.page_title}</Text>
                </View>
                <View style = {{width: '40%', height: '100%', justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row'}}>
                    <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.erase_case()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/erase.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.save_case()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/save_newcase.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity style = {{marginRight: 15}} onPress = {() => this.go_back()}>
                        <Image style = {{width: 30, height: 30}} resizeMode = {'contain'} source={require('../../assets/images/cancel_newcase.png')}/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style = {{width: '100%', height: top_tab_view_height, flexDirection: 'row'}}>
                <TouchableOpacity style = {[styles.top_tab_view, this.state.selected_top_tab == "Procedure" ? {borderBottomColor: '#e89d6c', borderBottomWidth: 1}: null]} onPress = {() => this.select_top_tab('Procedure')}>
                    <Text style = {styles.top_tab_text}>Procedure</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.top_tab_view, this.state.selected_top_tab == "Risks" ? {borderBottomColor: '#e89d6c', borderBottomWidth: 1}: null]} onPress = {() => this.select_top_tab('Risks')}>
                    <Text style = {styles.top_tab_text}>Risks</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.top_tab_view, this.state.selected_top_tab == "Alternatives" ? {borderBottomColor: '#e89d6c', borderBottomWidth: 1}: null]} onPress = {() => this.select_top_tab('Alternatives')}>
                    <Text style = {styles.top_tab_text}>Alternatives</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.top_tab_view, this.state.selected_top_tab == "Post-OP" ? {borderBottomColor: '#e89d6c', borderBottomWidth: 1}: null]} onPress = {() => this.select_top_tab('Post-OP')}>
                    <Text style = {styles.top_tab_text}>Post-OP</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.top_tab_view, this.state.selected_top_tab == "Treats" ? {borderBottomColor: '#e89d6c', borderBottomWidth: 1}: null]} onPress = {() => this.select_top_tab('Treats')}>
                    <Text style = {styles.top_tab_text}>Treats</Text>
                </TouchableOpacity>
            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}}>
                <KeyboardAwareScrollView style = {{width: '90%'}}>
                    <View style = {styles.component_view} onStartShouldSetResponder={() => this.showDateTimePicker()}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Procedure Date</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <TextInput style = {[styles.component_content_text, {padding: 0}]} editable={false} pointerEvents="none" placeholder = {"Select Procedure Date"}>{this.state.procDate_string}</TextInput>
                        </View>
                    </View>
                    <DateTimePicker
                        datePickerModeAndroid = {"calendar"}
                        isVisible={this.state.isDateTimePickerVisible}
                        onConfirm={this.handleDatePicked}
                        onCancel={this.hideDateTimePicker}
                        // minimumDate = {new Date()}
                        date = {this.state.showDate}
                    />
                    <View style = {styles.component_view} onStartShouldSetResponder={() => this.props.navigation.navigate("SelectProcedureName", {prev_screen: "Procedure"})}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Procedure Name</Text>
                        </View>
                        <View style = {[styles.component_content_view, {flexDirection: 'row'}]}>
                            <View style = {{width: '90%', height: '100%'}}>
                                <TextInput style = {[styles.component_content_text, {padding: 0}]} editable={false} pointerEvents="none" placeholder = {"Select Procedure Name"}>{this.state.procName}</TextInput>
                            </View>
                            <View style = {{width: '10%', alignItems: 'center', justifyContent: 'center'}}>
                                <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/search_icon.png')}/>
                            </View>
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Cpt code</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <Text style = {[styles.component_content_text, {padding: 0}]} multiline = {true}>{this.state.procCode}</Text>
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Consumer Name</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <Text style = {[styles.component_content_text, {padding: 0}]}>{this.state.procAlias}</Text>
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Success Rate %</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                        {
                            this.state.successRate == null &&
                            <Text style = {[styles.component_content_text, {padding: 0}]}>"Not Available"</Text>
                        }
                        {
                            this.state.successRate != null &&
                            <Text style = {[styles.component_content_text, {padding: 0}]}>{this.state.successRate}</Text>
                        }
                        </View>
                    </View>
                    <View style = {styles.component_view}>
                        <View style = {styles.component_title_view}>
                            <Text style = {styles.component_title_text}>Comments</Text>
                        </View>
                        <View style = {styles.component_content_view}>
                            <TextInput style = {[styles.component_content_text, {padding: 0}]} multiline = {true} placeholder = {'Input Comments'} onChangeText = {(text) => this.set_comments(text)}>{this.state.procComments}</TextInput>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </View>
            <View style = {styles.tab_view}>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Visit Master" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Visit Master")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Visit Master" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_master.png')}/>
                    </View>
                {
                    this.state.page_title == "Visit Master" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Master</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Symptoms" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Symptoms")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Symptoms" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_symptoms.png')}/>
                    </View>
                {
                    this.state.page_title == "Symptoms" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Symptoms</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Diagnosis" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Diagnosis")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Diagnosis" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_diagnosis.png')}/>
                    </View>
                {
                    this.state.page_title == "Diagnosis" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Diagnosis</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Prescription" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Prescription")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Prescription" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_prescription.png')}/>
                    </View>
                {
                    this.state.page_title == "Prescription" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Prescription</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Lab tests" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Lab tests")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Lab tests" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_laboratory.png')}/>
                    </View>
                {
                    this.state.page_title == "Lab tests" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Lab tests</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Procedure" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Procedure")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Procedure" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_procedure.png')}/>
                    </View>
                {
                    this.state.page_title == "Procedure" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Procedure</Text>
                    </View>
                }
                </TouchableOpacity>
                <TouchableOpacity style = {[styles.tab_item_view, this.state.page_title == "Referal" ? {width: "22%"} : null]} onPress = {() => this.select_tab("Referal")}>
                    <View style = {styles.tab_item_icon_view}>
                        <Image style = {[{width: '100%', height: '90%'}, this.state.page_title == "Referal" ? {opacity: 1} : {opacity: 0.7}]} resizeMode = {'contain'} source={require('../../assets/images/master_tab_referal.png')}/>
                    </View>
                {
                    this.state.page_title == "Referal" &&
                    <View style = {styles.tab_item_text_view}>
                        <Text style = {styles.tab_item_text}>Referal</Text>
                    </View>
                }
                </TouchableOpacity>
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
    tab_view: {
        width: '100%',
        height: tab_view_height,
        flexDirection: 'row',
        backgroundColor: '#bcb951'
    },
    tab_item_view: {
        width: '13%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tab_item_icon_view: {
        width: '100%',
        height: '60%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tab_item_text_view: {
        width: '100%',
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tab_item_text: {
        fontSize: 12,
        color: '#ffffff'
    },
    top_tab_view: {
        width: '20%', 
        height: '100%', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    top_tab_text: {
        fontSize: 12,
        color: '#000000'
    },


    component_view: {
        width: '100%',
        marginTop: 10
    },
    component_title_view: {
        width: '100%'
    },
    component_title_text: {
        fontSize: 12,
        color: '#808080'
    },
    component_content_view: {
        width: '100%',
        // height: 30,
        borderBottomColor: '#de9d73',
        borderBottomWidth: 1,
        justifyContent: 'flex-end',
        marginTop: 5
    },
    component_content_text: {
        fontSize: 16,
        color: '#000000'
    },
    
})