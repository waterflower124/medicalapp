/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment, Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  BackHandler,
  Alert
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {createStackNavigator, createAppContainer, createBottomTabNavigator} from "react-navigation"

import Global from "./src/utils/Global/Global"

import Splash from "./src/screens/Splash"
import Login from "./src/screens/Login"
import Home from "./src/screens/Home"
import AdvocateHome from "./src/screens/AdvocateHome"
import MyPatient from "./src/screens/MyPatient"
import WorkerSignup from "./src/screens/WorkerSignup"
import AdvocateSignup from "./src/screens/AdvocateSignup"
import ScoreFactors from "./src/screens/ScoreFactors"
import Advice from "./src/screens/Advice"
import ChatContacts from "./src/screens/chat/ChatContacts"
import ChatScreen from "./src/screens/chat/ChatScreen"
import ChatProfile from "./src/screens/chat/ChatProfile"
import Diagnosis from "./src/screens/Diagnosis"
import PendingLabs from "./src/screens/PendingLabs"
import PendingVisit from "./src/screens/PendingVisit"
import OpenCase from "./src/screens/OpenCase"
import NewCase from "./src/screens/NewCase"
import VisitMaster from "./src/screens/editcase/VisitMaster"
import SelectHospital from "./src/screens/editcase/SelectHospital"
import SelectDoctor from "./src/screens/editcase/SelectDoctor"
import Symptoms from "./src/screens/editcase/Symptoms"
import SelectSymptom from "./src/screens/editcase/SelectSymptom"
import EditDiagnosis from "./src/screens/editcase/EditDiagnosis"
import SelectDiagnosis from "./src/screens/editcase/SelectDiagnosis"
import Prescription from "./src/screens/editcase/Prescription"
import SelectMedicine from "./src/screens/editcase/SelectMedicine"
import LabTests from "./src/screens/editcase/LabTests"
import SelectLab from "./src/screens/editcase/SelectLab"
import Procedure from "./src/screens/editcase/Procedure"
import SelectProcedureName from "./src/screens/editcase/SelectProcedureName"
import Risks from "./src/screens/editcase/Risks"
import SelectRisk from "./src/screens/editcase/SelectRisk"
import Alternatives from "./src/screens/editcase/Alternatives"
import SelectAlternative from "./src/screens/editcase/SelectAlternative"
import PostOP from "./src/screens/editcase/PostOP"
import SelectInstruction from "./src/screens/editcase/SelectInstruction"
import Treats from "./src/screens/editcase/Treats"
import SelectTreat from "./src/screens/editcase/SelectTreat"
import Referal from "./src/screens/editcase/Referal"
import SelectBodyPart from "./src/screens/SelectBodyPart"
import CloseCase from "./src/screens/CloseCase"

import ICDCode from "./src/screens/icd/ICDCode"
import DifferentialDiagnosis from "./src/screens/icd/DifferentialDiagnosis"
import RequiredLabs from "./src/screens/icd/RequiredLabs"
import IcdSymptoms from "./src/screens/icd/IcdSymptoms"
import StrictPrecautions from "./src/screens/icd/StrictPrecautions"

import LabMaster from "./src/screens/labadmin/LabMaster"

import SymptomMaster from "./src/screens/symptomadmin/SymptomMaster"

import CptMaster from "./src/screens/cptadmin/CptMaster"
import CptRisks from "./src/screens/cptadmin/CptRisks"
import CptAlternatives from "./src/screens/cptadmin/CptAlternatives"
import CptPostOP from "./src/screens/cptadmin/CptPostOP"

import Advocate from "./src/screens/Advocate"

const AppNavigator = createStackNavigator ({
  Splash: {screen: Splash},
  Login: {screen: Login},
  Home: {screen: Home},
  AdvocateHome: {screen: AdvocateHome},
  MyPatient: {screen: MyPatient},
  WorkerSignup: {screen: WorkerSignup},
  AdvocateSignup: {screen: AdvocateSignup},
  ScoreFactors: {screen: ScoreFactors},
  Advice: {screen: Advice},
  ChatContacts: {screen: ChatContacts},
  ChatScreen: {screen: ChatScreen},
  ChatProfile: {screen: ChatProfile},
  Diagnosis: {screen: Diagnosis},
  PendingLabs: {screen: PendingLabs},
  PendingVisit: {screen: PendingVisit},
  OpenCase: {screen: OpenCase},
  NewCase: {screen: NewCase},
  VisitMaster: {screen: VisitMaster},
  SelectHospital: {screen: SelectHospital},
  SelectDoctor: {screen: SelectDoctor},
  Symptoms: {screen: Symptoms},
  SelectSymptom: {screen: SelectSymptom},
  EditDiagnosis: {screen: EditDiagnosis},
  SelectDiagnosis: {screen: SelectDiagnosis},
  Prescription: {screen: Prescription},
  SelectMedicine: {screen: SelectMedicine},
  LabTests: {screen: LabTests},
  SelectLab: {screen: SelectLab},
  Procedure: {screen: Procedure},
  SelectProcedureName: {screen: SelectProcedureName},
  Risks: {screen: Risks},
  SelectRisk: {screen: SelectRisk},
  Alternatives: {screen: Alternatives},
  SelectAlternative: {screen: SelectAlternative},
  PostOP: {screen: PostOP},
  SelectInstruction: {screen: SelectInstruction},
  Treats: {screen: Treats},
  SelectTreat: {screen: SelectTreat},
  Referal: {screen: Referal},
  SelectBodyPart: {screen: SelectBodyPart},
  CloseCase: {screen: CloseCase},

  ICDCode: {screen: ICDCode},
  DifferentialDiagnosis: {screen: DifferentialDiagnosis},
  RequiredLabs: {screen: RequiredLabs},
  IcdSymptoms: {screen: IcdSymptoms},
  StrictPrecautions: {screen: StrictPrecautions},

  LabMaster: {screen: LabMaster},

  SymptomMaster: {screen: SymptomMaster},

  CptMaster: {screen: CptMaster},
  CptRisks: {screen: CptRisks},
  CptAlternatives: {screen: CptAlternatives},
  CptPostOP: {screen: CptPostOP},

  Advocate: {screen: Advocate},
  
}, {
    transitionConfig: () => ({
      transitionSpec: {
        duration: 0,  // Set the animation duration time as 0 !!
      },
    }),
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
        // this.backButtonListener = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        
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
					if(currentScreen == 'Login' || currentScreen == 'Home' || currentScreen == 'AdvocateHome') {
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






