import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity, SafeAreaView,
  Linking,
  Alert,
  Share,
} from 'react-native';
import Mailer from 'react-native-mail';
import Hyperlink from 'react-native-hyperlink';

import { constants } from './../../constants';
import { convertWidth } from '../../utils';
import { AppProcessor } from '../../processors/app-processor';
import { EventEmitterService } from '../../services';
import { Actions } from 'react-native-router-flux';

const Contents = {
  KnowYourRights: {
    name: 'know-your-rights',
    filePathUrl: 'https://s3-ap-northeast-1.amazonaws.com/bitmark-mobile-files/retention.pdf'
  },
  PrivacyPolicy: {
    name: 'privacy-policy',
    filePathUrl: 'https://s3-ap-northeast-1.amazonaws.com/bitmark-mobile-files/privacy.pdf'
  },
  TermOfService: {
    name: 'term-of-service',
    filePathUrl: 'https://s3-ap-northeast-1.amazonaws.com/bitmark-mobile-files/term.pdf'
  },
}
export class BitmarkLegalComponent extends React.Component {
  static propTypes = {
    displayedContentName: PropTypes.string,
  };
  static Contents = Contents;
  constructor(props) {
    super(props);
    this.shareLegal = this.shareLegal.bind(this);
    let displayedContentName = this.props.displayedContentName;
    let displayedContent = Contents.PrivacyPolicy;
    if (displayedContentName === Contents.KnowYourRights.name) {
      displayedContent = Contents.KnowYourRights;
    } else if (displayedContentName === Contents.TermOfService.name) {
      displayedContent = Contents.TermOfService;
    }
    this.state = { displayedContentName, displayedContent };
  }

  shareLegal() {
    AppProcessor.doDownloadAndShareLegal(this.state.displayedContentName, this.state.displayedContent.filePathUrl).then(filePath => {
      Share.share({ title: this.state.displayedContentName, url: filePath }).then(() => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
      }).catch(error => {
        console.log('Share error:', error);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
      })
    }).catch(error => {
      console.log('doDownloadAndShareLegal error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    return (
      <SafeAreaView>
        <View style={[styles.header]}>
          <TouchableOpacity style={styles.headerLeft} onPress={Actions.pop}>
            <Image style={styles.headerLeftIcon} source={require('./../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            {this.state.displayedContentName === Contents.KnowYourRights.name && <Text style={styles.headerTitle}>KNOW YOUR RIGHTS</Text>}
            {this.state.displayedContentName === Contents.PrivacyPolicy.name && <Text style={styles.headerTitle}>PRIVACY POLICY</Text>}
            {this.state.displayedContentName === Contents.TermOfService.name && <Text style={styles.headerTitle}>TERMS OF SERVICE</Text>}
          </View>
          <TouchableOpacity style={styles.headerRight} />
        </View>

        <View style={[styles.body]}>
          {this.state.displayedContentName === Contents.KnowYourRights.name && <View style={styles.swipePageContent}>
            <TouchableOpacity onPress={() => Linking.openURL('https://twitter.com/gigastacey/status/904343096858697728')}>
              <Text style={[styles.contentNormalText, { paddingTop: 40, paddingBottom: 40, color: '#0060F2' }]}>
                Original idea comes from Stacey Higginbotham
            </Text>
            </TouchableOpacity>
            <View style={styles.knowYourRightsRow}>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(222), fontWeight: '800' }]}>TYPE OF DATA</Text>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(47), fontWeight: '800' }]}>RETAIN</Text>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(35), fontWeight: '800' }]}>SELL</Text>
            </View>

            <View style={styles.knowYourRightsRow}>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(222) }]}>Email (to map Bitmark accounts)</Text>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(47) }]}>yes</Text>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(35) }]}>no</Text>
            </View>

            <View style={styles.knowYourRightsRow}>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(222) }]}>Log data (when accessing website)	</Text>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(47) }]}>yes</Text>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(35) }]}>no</Text>
            </View>

            <View style={styles.knowYourRightsRow}>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(222) }]}>Bitmark account number	</Text>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(47) }]}>yes</Text>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(35) }]}>no</Text>
            </View>

            <View style={styles.knowYourRightsRow}>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(222) }]}>Bitmark account (in case of webapp)</Text>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(47) }]}>yes</Text>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(35) }]}>no</Text>
            </View>

            <View style={[styles.knowYourRightsRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(222) }]}>Digital assets</Text>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(47) }]}>yes</Text>
              <Text style={[styles.knowYourRightsRowText, { width: convertWidth(35) }]}>no</Text>
            </View>
            <Text style={[styles.knowYourRightsRowText, { marginLeft: convertWidth(19) }]}>(with or without client side encryption)	</Text>


          </View>}

          {this.state.displayedContentName === Contents.PrivacyPolicy.name && <View style={styles.swipePageContent}>
            <Text style={styles.contentCreatedText}>Last Updated: 19 JAN, 2018{'\n'}</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => {
              console.log('url :', url);
              Linking.openURL(url);
            }} >
              <Text style={styles.contentNormalText}>
                Bitmark Inc. ("Company") provides this Privacy Policy to inform users of our policies and procedures regarding the collection, use and disclosure of personally identifiable information received from users of website located at the bitmark.com domain and subdomains ("Web Site"), and the downloadable and web-based software application (collectively, the "Application"), and any services provided by Company (together with the Website and the Application, the "Services"). Any terms not defined in this Privacy Policy are defined in the Company Terms of Service, located here: https://bitmark.com/terms.
            </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>WEBSITE INFORMATION COLLECTION AND USE</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                It is not necessary to provide Company with your personally identifiable information to use the Web Site, and Company does not collect personally identifiable information in connection with the operation of the Web Site. If you contact Company by email through the Web Site, Company may keep a record of your contact information and correspondence, and may use your email address, and any information that you provide to Company in your message, to respond to you. Company treats this information as it would treat any other unsolicited business correspondence, and has no obligation to keep this information confidential, nor to take any security measures to protect this information.{'\n\n'}
                When you visit the Web Site or use the Website to download an Application, Company's servers automatically record information that your browser sends whenever you visit a website ("Log Data"). This Log Data may include information such as your IP address, browser type or the domain from which you are visiting. For most users accessing the Internet from an Internet service provider, the IP address may be different every time you log on. Company uses Log Data to monitor use of the Web Site and the services we offer via the Web Site and for the Web Site's technical administration.
              </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>APPLICATION INFORMATION COLLECTION AND USE</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                We collect the following information in connection with your use of the Applications, and use it as described:{'\n\n'}
                Log Data is collected as part of your use of the web version of the Application. We use Log Data to monitor use of the web version of the Application, to provide the web version of the Application to you, and to improve the web version of the Application and the other Services we provide.{'\n'}
                Your email address is required to use the web version of the Application. We use your email address to provide the web version of the Application to you and to communicate with you about your use of the Application.{'\n'}
                Your Bitmark Account Number is used to identify you within the Services and to enable you to use the Services to manage your Bitmark Property System Account, and is visible to other Users of the Services. It is not attached to other personally identifiable information unless (a) you are using the web version of the Application, in which case your Bitmark Account Number is tied to your email address, or (b) you specifically choose to publicly identify your account with an email address or other personal information.{'\n'}
                The source, title and metadata regarding each Digital Asset managed through our Services, a thumbnail picture of that Digital Asset (only if the Digital Asset is not encrypted), and the associated bitmark. This information is public.{'\n'}
                Any personally identifiable information you choose to make available within the Services by publicly identifying your account. This information is visible to other users of the Service.{'\n'}
                Users using the Services to transfer a bitmark from their Bitmark Property System account to another must provide payment information (presently payment card information) We do not ourselves retain or use payment card information. Your payment card information will be retained by our Payment Processor under their privacy policy, which can be found here: https://stripe.com/us/privacy.{'\n'}
                As a general matter we use information we collect from you to monitor, research, analyze and report on the usage of the Services, to administer, operate, and improve the Services and our business, to process transactions relating to the use of the Services; and to enforce or exercise any rights in our terms and conditions and enforce compliance with laws and law enforcement.
              </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>PUBLIC INFORMATION</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                Any information in the Bitmark Property System is permanently and irrevocably public by design. That includes the public key that forms your Bitmark Account Number, the bitmarks themselves, and the records of any transfers of bitmarks to or from your Bitmark Account.{'\n\n'}
                You are not required to disclose any information in your public profile within the Services, and you can encrypt Digital Assets to prevent our Services from creating thumbnails of those Digital Assets. However, any information you provide to us when you publicly identify your account, in the title or metadata of your Digital Asset, or in unencrypted Digital Assets is publicly viewable, and is not in any way confidential or private. Think carefully before disclosing any personally identifiable information in any public forum. What you have written may be seen and/or collected by third parties and may be used by others in ways we are unable to control or predict.
            </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>COOKIES</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                Like many websites, Company also uses "cookie" technology to collect additional website usage data and to improve the Web Site and the services offered via the Web Site (including the web version of the Application). A cookie is a small data file that Company's servers transfer to your computer's hard disk. Company does not use cookies to collect personally identifiable information. However, IP addresses are collected by the use of cookies. Company mainly uses "session cookies", which enable certain features of the Web Site and services offered via the Web Site, to better understand how you interact with the Web Site and services we offer via the Web Site, to monitor aggregate usage by our users and web traffic routing on the Web Site, and to improve the Web Site and services offered via the Web Site. This session cookie should be deleted from your computer when you disconnect from or leave the Web Site. Most Internet browsers automatically accept cookies. You can instruct your browser, by editing its options, to stop accepting cookies or to prompt you before accepting a cookie from the websites you visit. Please note, however, that if you don't accept cookies, you may not be able to access all portions or features of certain websites.
            </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>WEB BEACONS?</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                We or our email service provider may also use "web beacons" or "tracking pixels". Web beacons or tracking pixels are small graphic images in email messages to determine whether the messages were opened and the links were clicked. If you choose not to receive web beacons / tracking pixels in your emails, you will need to disable HTML images in your email program, but that may affect images in other emails you receive.
            </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>SPECIFIC SERVICE PROVIDERS</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                Presently, the only third-party analytics service provider we use is Google Analytics. For Google's privacy practices see https://support.google.com/analytics/answer/6004245. To opt out of data recording and analysis by Google, see https://tools.google.com/dlpage/gaoptout.
            </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>DO NOT TRACK</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                We use only session cookies as described above. We do not use cookies to collect personally identifiable information or track users' online activities over time and across different web sites. For more information regarding Do Not Track mechanisms, see http://allaboutdnt.com.
              </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>INFORMATION SHARED WITH OTHERS</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                We may engage third party service providers to work with us to administer and provide the Services. These third-party service providers have access to information collected through the Services only for the purpose of performing services on our behalf.{'\n'}
                We may share aggregated information and information about users (but not personally identifiable information) with third parties for industry analysis, targeting advertising or other communications, demographic profiling and other similar purposes.{'\n'}
                Information collected through the Services including personally identifiable information, is considered to be a business asset. As a result, if we go out of business or enter bankruptcy or if we are acquired as a result of a transaction such as a merger, acquisition or asset sale, the information collected through the Services may be disclosed or transferred to the third-party acquirer in connection with the transaction.{'\n'}
                It is our policy to protect you from having your privacy violated through abuse of the legal systems, whether by individuals, entities or government, and to contest claims that we believe to be invalid under applicable law. However, it is also our policy to cooperate with government and law enforcement officials and private parties. Accordingly, we reserve the right to disclose any information about you to government or law enforcement officials or private parties as we, in our sole discretion, believe necessary: (a) to satisfy or comply with any applicable law, regulation or legal process or to respond to lawful requests, including subpoenas, warrants or court orders; (b) to enforce our agreements with you or third parties, to protect our property, rights and safety and the rights, property and safety of third parties or the public in general; and (c) to prevent or stop activity we consider to be illegal or unethical.
              </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>SECURITY</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                We take reasonable measures to protect from unauthorized access, use or disclosure the information that we collect. Please be aware, however, that no method of transmitting information over the Internet or storing information is completely secure. Accordingly, we cannot guarantee the absolute security of any information.
            </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>LINKS TO OTHER SITES</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                The Web Site may contain links to other web sites ("Linked Sites") operated by Company or third parties. Linked Sites may place their own cookies or other files on your computer, collect data or solicit personal information from you. This Privacy Policy addresses only the use and disclosure of information that Company collects through this Web Site. Other sites follow different rules regarding the use or disclosure of the personal information you submit to them. Company does not exercise control over third party Linked Sites. Your use of any Linked Site operated by Company is subject to the terms and conditions provided by Company for such Linked Site. Company encourages you to read the privacy policies or statements of the other websites you visit.
            </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>OUR POLICY TOWARDS CHILDREN</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Mailer.mail({ subject: 'Suggestion for Bitmark Health', recipients: [url], }, (error) => {
              if (error) {
                Alert.alert('Error', 'Could not send mail.');
              }
            })} >
              <Text style={styles.contentNormalText}>
                This Web Site is not directed to children under 18. If a parent or guardian becomes aware that his or her child has provided Company with personally identifiable information without their consent, he or she should contact Company at support@bitmark.com. If Company becomes aware that a child under 13 has provided Company with personally identifiable information, Company will remove such information from our files.
            </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>CHOICES AND CONTROL</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                You can always opt not to disclose information to us, but keep in mind that some information is needed to use the Applications, and if you do not disclose that information, you cannot use the Applications.{'\n'}
                You can stop us from collecting further information about you through the Services by closing your Services account. You may also be able to add, update, or delete certain information using the Settings functionality of the Applications, including by closing your Services account. However, please be aware that information already incorporated the Bitmark Property System remains publicly visible in the Bitmark Property System, and any information which you previously made public within our Services will remain public in our Services in its then-current form. We may also maintain a copy of the unrevised or deleted information in our records to the extent we believe necessary for legal compliance or protection of our interests. We may also use any aggregated data derived from or incorporating your information after you update or delete it, but not in a manner that would identify you personally.
            </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>CHANGES TO THIS PRIVACY POLICY</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Mailer.mail({ subject: 'Suggestion for Bitmark Health', recipients: [url], }, (error) => {
              if (error) {
                Alert.alert('Error', 'Could not send mail.');
              }
            })} >
              <Text style={styles.contentNormalText}>
                Company reserves the right to change this policy at any time without prior notice. Any changes to this policy will be posted here. You are advised to consult this Privacy Policy regularly for any changes. If you have any questions or comments about this Privacy Policy, please contact us at support@bitmark.com.
            </Text>
            </Hyperlink>

          </View>}

          {this.state.displayedContentName === Contents.TermOfService.name && <View style={styles.swipePageContent}>
            <Text style={styles.contentCreatedText}>Last Updated: 19 JAN, 2018{'\n'}</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                These Terms of Service (this "Agreement") govern the use of the downloadable and web-based software application (collectively, the "Application") provided by Bitmark Inc. ("Company" or "us"), the website and website domain name and any other linked pages, features, or content, or application services offered from time to time by Company in connection therewith (collectively, the "Website") and any services provided by Company (together with the Website and the Application, the "Services"). Please read this agreement carefully before accessing or using the Application or any other Services. Each time you access or use the Services, you agree to be bound by this Agreement. If you are an individual entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these terms and conditions, in which case "you" shall refer to such entity. If you do not agree to be bound by this Agreement, you should not access or use the Services. In addition, certain elements of the Services may be subject to additional terms of use. In the event that any of the additional terms of use governing such elements conflict with this Agreement, the additional terms will control.
            </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>SERVICES DESCRIPTION AND AGREEMENT APPLICABILITY</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => {
              if (url.indexOf('@bitmark.com') >= 0) {
                Mailer.mail({ subject: 'Suggestion for Bitmark Health', recipients: [url], }, (error) => {
                  if (error) {
                    Alert.alert('Error', 'Could not send mail.');
                  }
                })
              } else {
                Linking.openURL(url);
              }
            }} >
              <Text style={[styles.contentNormalText]}>The Services consist primarily of tools allowing users to:{'\n'}</Text>
              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>1.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  create, access and manage accounts within a distributed, publicly available registry and ledger system (the "Bitmark Property System") which uses blockchain technology to allow users to create unique identifiers (each a "bitmark") to claim ownership of digital files containing data, text, graphics, articles, photographs, images, illustrations, software and other items of content or technology (each a "Digital Asset" and together with the associated bitmark, each a "Crypto property");{'\n'}
                </Text>
              </View>
              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>2.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  to provide additional information of potential utility to users, such as descriptions of Digital Properties ("Ancillary Information"); and{'\n'}
                </Text>
              </View>
              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>3.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  to store Digital Assets, and to permit users of the Service to distribute copies of the Digital Assets to other users of the Services, concurrent with the transfer of the associated bitmark to the same recipient(s);{'\n'}
                </Text>
              </View>
              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>4.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  to transfer such bitmarks from one user of the Bitmark Property System to another user of the Bitmark Property System.{'\n'}
                </Text>
              </View>
              <Text style={[styles.contentNormalText, { marginTop: 0 }]}>
                The use of the Bitmark Property System requires establishment of an account consisting of a public and private key pair (the "Bitmark Account"). The public key is the "Bitmark Account Number". You may establish a Bitmark Account through the Services or through another mechanism of your selection. Please note that any information recorded in the Bitmark Property System (whether through the Services or otherwise), including your Account Number, bitmarks, and transaction records, is made permanently public. The handling of information transmitted to and from the Bitmark Property System through the Services is explained further in Company's current Privacy Policy, located at http://bitmark.com/privacy.{'\n\n'}
                This Agreement applies to all users of the Services, including without limitation users who utilize the Services to store and transfer Digital Assets, to issue and track ownership of bitmarks, or to transfer or receive bitmarks. Terms specific to issuers, owners, transferors or recipients apply to users when utilizing the Services in such role. Terms of general applicability apply to all users.{'\n\n'}
                If you have any questions or suggestions, please feel free to email us at support@bitmark.com.
              </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>ACCESS TO THE SERVICES</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => {
              if (url.indexOf('@bitmark.com') >= 0) {
                Mailer.mail({ subject: 'Suggestion for Bitmark Health', recipients: [url], }, (error) => {
                  if (error) {
                    Alert.alert('Error', 'Could not send mail.');
                  }
                })
              } else {
                Linking.openURL(url);
              }
            }} >
              <Text style={styles.contentNormalText}>
                <Text style={{ fontWeight: '600' }}>Basic Conditions.</Text> While bitmarks and the Bitmark Property System generally serve as records of the ownership and transfer of Crypto property and are available through the documented interfaces to the Bitmark Property System, the Services are owned by Company, and the Company only grants you permission to use the Services as made available by the Company.{'\n\n'}
                The Services are provided solely for your own use, and not for the use or benefit of any third party. To use the Services, you must use an Application to establish or access an account (i.e., a public key paired with a private key under your control) within the Bitmark Property System. If you wish to use the Services to transfer bitmarks, you will also need to provide valid financial information to enable payment to be made and received. Company may change, suspend or discontinue all or any of the Services at any time. Company may also impose limits on certain features and services or restrict your access to part or all of the Services without notice or liability. Company reserves the right, in its sole discretion, to modify this Agreement at any time by amending this Agreement in writing and providing notice through the Services. You shall be responsible for reviewing and becoming familiar with any such modifications. Your use of the Services following such notification constitutes your acceptance of the terms and conditions of this Agreement as modified.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Services as Access to Bitmark Property System.</Text> The Services allow you to record in the Bitmark Property System the creation of bitmarks associated with Crypto property and transactions between recipients and transferors of bitmarks associated with Crypto property as directed by users of the Bitmark Property System (whether or not such direction is through Services), and to access listings of bitmarks and Crypto property within the Bitmark Property System. Company has no control over the quality, safety, morality or legality of any aspect of any Crypto property, the truth or accuracy of the listings, the ability or right of transferors to sell copies of Crypto property or the ability of recipients to pay. Company does not pre-screen users, or the Crypto property or information provided by users. Company cannot ensure that a recipient or transferor will actually complete a transaction, and the use of the Services to record a transfer of a bitmark in the Bitmark Property System does not transfer legal ownership or rights in the associated Crypto property from the transferor to the recipient.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Registration and Security.</Text> As a condition to using the Services, you must use an Application to create or access an account in the Bitmark Property System (the "Bitmark Account") consisting of a public and private key pair. The public key is the "Bitmark Account Number". Creating an account using the Application as hosted by Company requires a correct email address. Creating an account using the downloadable Application does not require that you provide any contact information to Company. To transfer bitmarks using the Services, users must provide complete and accurate payment information as required for the payment mechanism used by the user. You shall provide Company with accurate, complete, and updated payment information. Company reserves the right, in its sole discretion, to refuse to allow the use of the Services to establish or access an account in the Bitmark Property System. You are solely responsible for maintaining the confidentiality of your Bitmark Account and any other confidential Services or Bitmark Property System account information.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Persons Under 13; Your Right to Enter into a Contract.</Text> Company does not knowingly collect or solicit personal information from anyone under the age of 13 or knowingly allow such persons to register for the Services. If you are under 13, please do not attempt to register for the Services or send any information about yourself to us, including your name, address, telephone number, or email address. No one under age 13 may provide any personal information to Company or on the Services. In the event that we learn that we have collected personal information from a child under age 13 without verification of parental consent, we will delete that information as quickly as possible. If you believe that we might have any information from or about a child under 13, please email us at support@bitmark.com.{'\n\n'}
                You represent and warrant to Company that: (i) you are an individual and you are of legal age to and have the authority to form a binding contract; (ii) all Services account information you submit is accurate and truthful; and (iii) you will maintain the accuracy of such information. You also certify that you are legally permitted to use and access the Services and take full responsibility for the selection and use of and access to the Services. This Agreement is void where prohibited by law, and the right to access the Services is revoked in such jurisdictions.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Fees and Payment.</Text> Certain of the Services are currently free to use and certain of the Services require payment, as described in our Fee Schedule at https://bitmark.com/resources/faq#fees. Company reserves the right to require payment of fees for certain or all Services. You shall pay all applicable fees, as described within the Services, in connection with such Services selected by you. Company reserves the right to change its Fee Schedule and to institute new charges at any time, upon notice to you, which may be sent by email or posted within the Services. Your use of the Services following such notification constitutes your acceptance of any new or increased charges. Any fees paid hereunder are non-refundable. Transferors and recipients may not alter pricing after a sale for the purpose of avoiding Company processing fees, or otherwise avoid or attempt to avoid Company's processing fees.
              </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>TRANSFERRING CRYPTO PROPERTY</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                The following terms govern the use of the Services to transfer bitmarks.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Transferor Policies.</Text> Transferors who take payment for the transfer of Digital Properties are strongly encouraged to establish and disclose to potential recipients their policies regarding payment, refunds and other sales policies. Transferors must create reasonable policies in good faith, must abide by such policies, and are responsible for enforcing their own policies. All transferor policies must comply with this Agreement, Company's policies for the Services generally, applicable law and fair business practices.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Disclosure by Transferor.</Text> You warrant that you and all aspects of the Crypto property you may make available through the Services comply with the terms of this Agreement and any Company-published policies. You also warrant that you may legally transfer all rights you purport to transfer in any Crypto property you that you use the Services to transfer. You must accurately describe your Crypto property and all terms of sale or license to any purchaser.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Transfer of bitmarks.</Text> Company does not transfer bitmarks or copies of Crypto property from a transferor to a recipient except as instructed by the parties. Each transferor and recipient shall have sole and complete discretion whether to enter into transactions with each other, and on what terms, provided that each recipient and transferor represent and warrant to Company that they will comply with this Agreement and all Company-published policies.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Transfer.</Text> Upon receiving instructions from transferor, the Services will enter a transfer of the relevant bitmark from the transferor's Bitmark Property System account to the recipient's Bitmark Property System account. If the associated Digital Asset is made available to Company according to the instructions for the use of the Application, Company will use reasonable efforts to transfer a copy of the relevant Digital Asset from the transferror to the recipient. If recipient does not receive a copy of the relevant Digital Asset through the Services, recipient must look solely to the transferor to acquire a copy of the relevant Digital Asset.. You agree that (i) each transfer of Crypto property made using the Services is a transaction between the recipient and the transferror, and not a transaction with Company; and (ii) Company is not a party to such transaction, nor is Company a recipient or a transferror in connection with any such transaction.{'\n\n'}
                In order to facilitate the distribution of copies of Digital Assets, Company may share recipient and transferror contact information, including the emails of each party, and in particular, must record the transfer of the Crypto property in the Bitmark Property System and the Services. Company is not responsible for what either party does with this information once transmitted by Company.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Reversing Transactions.</Text> Each transaction will be governed by the terms agreed between the transferor and recipient, including but not limited to whether a transaction may be reversed and/or refunds given, and under what conditions, and whether transferor or recipient is responsible for additional costs associated with any reversed transactions or refunds. Company has absolutely no control over any of the foregoing.{'\n\n'}
                Users acknowledge that all transactions completed using the Services are final, and that a return or refund may be accomplished only by reversing the transaction, which may incur a processing fee payable to Company.{'\n\n'}
                Company will not attempt to resolve or mediate, or become involved in any way in claims between recipients and transferors. If recipients have a concern or question regarding a refund or reversing a transaction, they must contact the transferor directly.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Payments.</Text> Company uses a third-party payment processor (the "Payment Processor") to enable transferors to use credit cards and other conventional payment mechanisms to pay for transfers of Crypto property. Company's current Payment Processor is Stripe. The processing of payments will be subject to the terms, conditions and privacy policies of the Payment Processor in addition to this Agreement. The terms and conditions of the Payment Processor may be found at https://stripe.com/us/terms; the Payment Processor's Privacy Policy may be found at https://stripe.com/us/privacy.{'\n\n'}
                Company is not responsible for errors made by the Payment Processor, or otherwise in connection with the processing of transactions. By electing to use the Payment Processor to pay for transfers of Digital Properties, you agree to make payment through the Payment Processor. Please be aware that you are responsible for the payment of any tax(es) that may apply to such transactions. For each purchase, you grant Company the right to correct any errors or mistakes that are made regarding the purchase price of an order, even where Company has already received payment from you.{'\n\n'}
                YOU MUST PROVIDE CURRENT, COMPLETE AND ACCURATE INFORMATION IN ORDER FOR YOUR PAYMENTS TO BE PROCESSED. YOU MUST PROMPTLY UPDATE AND MAINTAIN THE ACCURACY OF ALL INFORMATION TO ENABLE THE COMPLETION OF YOUR TRANSACTION (SUCH AS A CHANGE IN BILLING OR PAYMENT ADDRESS, BANK ACCOUNT INFORMATION, CREDIT CARD NUMBER, OR CREDIT CARD EXPIRATION DATE), AND YOU MUST PROMPTLY NOTIFY US IF YOUR FORM OF PAYMENT IS CANCELED (E.G., FOR LOSS OR THEFT) OR IF YOU BECOME AWARE OF A POTENTIAL BREACH OF SECURITY, SUCH AS THE UNAUTHORIZED DISCLOSURE OR USE OF A CREDIT OR DEBIT CARD, BANKING INFORMATION, OR YOUR PERSONAL INFORMATION.
              </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>SERVICES CONTENT, USE AND GENERAL TERMS</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                <Text style={{ fontWeight: '600' }}>Limited License to You.</Text> The Services and the contents thereof (excluding only content originating in the Bitmark Property System, such as bitmarks, Bitmark Property System account identifiers, and transaction records) are intended solely for the use of Services users and may only be used in accordance with the terms of this Agreement. All materials displayed or performed on the Services (including, but not limited to text, graphics, articles, photographs, images, illustrations—also referred to in this Agreement as the "Content", and which includes Digital Assets, Property and other User Submissions (both as defined below)—are protected by copyright and other intellectual property rights. You shall abide by all proprietary rights notices, trademark rules, information, and restrictions contained in any Content, software or materials in the Services and shall not use, copy, reproduce, modify, translate, publish, broadcast, transmit, distribute, perform, upload, display, license, sell, create derivative works based on, perform, or in any way exploit, any of the Content, software, materials, or Services in whole or in part, or otherwise exploit other than as otherwise provided for in these Terms any Content or third party submissions or other proprietary rights not owned by you: (i) without the express prior written consent of the respective owners, and (ii) in any way that violates any third party right.{'\n\n'}
                All of the foregoing notwithstanding, we do not control or claim to control Content originating from the Bitmark Property System except when accessed through the Services, nor to regulate your access or use of such Content through a mechanism other than the Services; provided, however, that we may terminate your use of the Services if we determine, in our sole discretion that such non-Services access or use harms or is likely to harm the Services, the Company, or any other entity, is contrary to applicable law or detrimental to our reputation.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Digital Properties and other User Submissions.</Text> In the course of using the Services, you and other users may use the Services to register or transfer digital Assets and may also provide Ancillary Information regarding such Digital Assets. Digital Assets and Ancillary Information are, collectively, "User Submissions". You acknowledge and agree that we may use, create derivative works of, and distribute the User Submissions as reasonably necessary to provide the Services and interact with the Bitmark Property System. By way of example, and not limitation, we may (if you so request) create thumbnails or previews of the Digital Assets in order to display the thumbnails / previews within the Services, display and transmit Ancillary Information in the form of pricing or descriptions of the Digital Assets, and mathematically transform each Digital Asset into a bitmark associated with such Digital Asset.{'\n\n'}
                In order to enable Company to provide the Services, you hereby grant Company a non-exclusive, worldwide, royalty free, sublicenseable and transferable right to access and use the User Submissions you submit to the Services , which license includes the right to use, reproduce and create derivative works of the Digital Assets to: generate bitmarks associated with such Digital Assets; record such bitmarks and the transfer of such bitmarks within the Bitmark Property System; if and as you request, to create thumbnails or previews of the Digital Assets and copy, transmit and display the same, and if and as you request, to copy, transmit and display the Ancillary Information.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>No Company Responsibility.</Text> You understand that all information publicly posted or privately transmitted through the Services (including within the Bitmark Property System) is the sole responsibility of the person from which such content originated and that Company will not be liable for any errors or omissions in any such information. You understand that Company cannot guarantee the identity of any other users with whom you may interact in the course of using the Services. Additionally, Company cannot guarantee the authenticity of any data that users may provide about themselves. You acknowledge that all Content accessed, used, or acquired by you using the Services is at your own risk and you will be solely responsible for any damage or loss to any party resulting therefrom.{'\n\n'}
                Under no circumstances will Company be liable in any way for any Content, including, but not limited to, any errors or omissions in any Content, or any loss or damage of any kind incurred in connection with use of or exposure to any Content identified, linked, made available or transferred via the Services.{'\n'}
              </Text>
              <Text style={[styles.contentNormalText, { marginTop: 0 }]}>
                <Text style={{ fontWeight: '600' }}>Restrictions.</Text> You warrant, represent and agree that you will not contribute any Content or otherwise use the Services in a manner that (i) infringes or violates the intellectual property rights or proprietary rights (including, without limitation, copyright, trademark, patent rights, trade secrets and/or any moral rights where applicable), rights of publicity or privacy, or other rights of any third party; (ii) violates any law, statute, ordinance or regulation; (iii) is harmful, fraudulent, deceptive, threatening, abusive, harassing, degrading, intimidating, tortious, defamatory, vulgar, obscene, libelous, or otherwise objectionable; (iv) impersonates any person or entity, including without limitation any employee or representative of Company; (v) restricts or inhibits any other user from using and enjoying the Services or Content; (vi) relate to products that are sexual or pornographic in nature, alcoholic products, tobacco products or other products that are unlawful in any manner; or (vii) contains a virus, trojan horse, worm, time bomb, or other harmful computer code, file, or program. Company reserves the right to remove any Content from the Services at any time, for any reason (including, but not limited to, upon receipt of claims or allegations from third parties or authorities relating to such Content or if Company is concerned that you may have breached the immediately preceding sentence), or for no reason at all. You, not Company, remain solely responsible for all Content that you upload, post, email, transmit, or otherwise disseminate using, or in connection with, the Services, and you warrant that you possess all rights necessary to provide such Content to Company and to grant Company the rights to use such information in connection with the Services and as otherwise provided herein.{'\n\n'}
                You are responsible for all of your activity in connection with the Services. Any fraudulent, abusive, or otherwise illegal activity may be grounds for termination of your right to access or use the Services. You may not post or transmit, or cause to be posted or transmitted, any communication or solicitation designed or intended to obtain password, account, or private information from any other user of the Services. Use of the Services to violate the security of any computer network, crack passwords or security encryption codes, transfer or store illegal material (including material that may be considered threatening or obscene), or engage in any kind of illegal activity is expressly prohibited. You will not run a mail list, listserv, any form of auto-responder, nor use the Services to send or route "spam", nor run any processes that otherwise interfere with the proper working of or place an unreasonable load on the Services infrastructure. Further, the use of manual or automated software, devices, or other processes to "crawl," "scrape," or "spider" any page of the Website is strictly prohibited. You will not decompile, reverse engineer, or otherwise attempt to obtain the source code of any element of the Services. You will be responsible for withholding, filing, and reporting all taxes, duties and other governmental assessments associated with your activity in connection with the Services.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Warranty Disclaimer.</Text> Company has no special relationship with or fiduciary duty to you. You acknowledge that Company has no control over, and no duty to take any action regarding: which users gain access to the Services; what Content you access via the Services; what effects the Content may have on you; how you may interpret or use the Content; or what actions you may take as a result of having been exposed to the Content. You release Company from all liability for you having acquired or not acquired Content through the Services. The Services may contain or direct you to websites or services containing information that some people may find offensive or inappropriate. Company makes no representations concerning any content contained in or accessed through the Services, and Company is not responsible or liable for the accuracy, copyright compliance, legality or decency of material contained in or accessed through the Services. THE SERVICES, CONTENT (INCLUDING ALL DIGITAL PROPERTIES), WEBSITE, PRODUCTS AND SERVICES OBTAINED THROUGH THE WEBSITE, AND ANY SOFTWARE, ARE PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND FROM COMPANY OR ANY PERSON ACTING ON BEHALF OF COMPANY, WHETHER SUCH WARRANTIES ARE EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR THAT USE OF THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE. TO THE EXTENT THE LAWS OF YOUR JURISDICTION DO NOT PERMIT SUCH DISCLAIMERS, YOU AGREE THAT COMPANY PROVIDES ONLY THE MINIMUM LAWFUL WARRANTY, AND DISCLAIMS ALL WARRANTIES TO THE EXTENT PERMITTED BY APPLICABLE LAW.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Privacy Policy.</Text> For information regarding Company's treatment of personally identifiable information, please review Company's current Privacy Policy, located at http://bitmark.com/privacy, which is hereby incorporated by reference. Your acceptance of this Agreement constitutes your acceptance and agreement to be bound by Company's Privacy Policy.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Indemnity.</Text> You will indemnify and hold Company, its parents, subsidiaries, affiliates, officers, and employees harmless (including, without limitation, from all damages, liabilities, settlements, costs and attorneys' fees) from any claim or demand made by any third party (including any other user of the Services) or any dispute between you and a third party (including any other user of the Services) due to or arising out of your access to or use of the Services, Crypto property you register or transfer through the use of the Services, your violation of this Agreement, or the infringement by you, or any third party using your account, of any intellectual property or other right of any person or entity.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Limitation of Liability.</Text> Your interactions with organizations and/or individuals found on or through the Services, including payment for and delivery of goods or services, and any other terms, conditions, warranties or representations associated with such dealings, are solely between you and such organizations and/or individuals. You should make whatever investigation you feel necessary or appropriate before proceeding with any online or offline transaction with any of these third parties. You agree that Company shall not be responsible or liable for any loss or damage of any sort incurred as the result of any such dealings. If there is a dispute between participants in the Services, or between any user of the Services and any third party, you understand and agree that Company is under no obligation to become involved. In the event that you have a dispute with one or more other users, you hereby release Company, its officers, employees, agents, and successors in rights from claims, demands, and damages (actual and consequential) of every kind or nature, known or unknown, suspected or unsuspected, disclosed or undisclosed, arising out of or in any way related to such disputes. If you are a California resident, you shall and hereby do waive California Civil Code Section 1542, which says: "A general release does not extend to claims which the creditor does not know or suspect to exist in his favor at the time of executing the release, which, if known by him must have materially affected his settlement with the debtor."{'\n\n'}
                IN NO EVENT SHALL COMPANY, OR ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE WITH RESPECT TO THE SERVICES OR THE SUBJECT MATTER OF THIS AGREEMENT UNDER ANY CONTRACT, NEGLIGENCE, TORT, STRICT LIABILITY OR OTHER LEGAL OR EQUITABLE THEORY (I) FOR ANY AMOUNT IN THE AGGREGATE IN EXCESS OF THE GREATER OF $100 OR THE FEES PAID BY YOU FOR THE SERVICES DURING THE 12-MONTH PERIOD PRECEDING THE APPLICABLE CLAIM; (II) FOR ANY INDIRECT, INCIDENTAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES OF ANY KIND WHATSOEVER; (III) FOR DATA LOSS OR COST OF PROCUREMENT OF ANY SUBSTITUTE GOODS OR SERVICES; OR (IV) FOR ANY MATTER BEYOND COMPANY'S REASONABLE CONTROL. TO THE EXTENT THE LAWS OF YOUR JURISDICTION DO NOT PERMIT SUCH A LIMITATION OF LIABILITY, YOU AGREE THAT COMPANY DISCLAIMS ALL LIABILITY TO THE EXTENT PERMITTED BY APPLICABLE LAW.
            </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>THIRD-PARTY SERVICES; BITMARK PROPERTY SYSTEM.</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => Linking.openURL(url)} >
              <Text style={styles.contentNormalText}>
                The Services may contain links to third party websites or services ("Third Party Services") that are not owned or controlled by Company, or the Services may be accessible by logging in through a Third Party Service, as described more fully in our Privacy Policy, located at http://bitmark.com/privacy. When you access Third Party Services, you do so at your own risk. You hereby represent and warrant that you have read and agree to be bound by all applicable policies of any Third Party Services relating to your use of the Services and that you will act in accordance with those policies, in addition to your obligations under this Agreement.{'\n\n'}
                The Services allow access to and use of the Bitmark Property System, which is a distributed system that Company does not control. All information submitted to the Bitmark Property System is publicly available and cannot be removed from the Bitmark Property System. When you access or use the Bitmark Property System, you do so at your own risk.{'\n\n'}
                Company has no control over, and assumes no responsibility for, the content, accuracy, privacy policies, or practices of or opinions expressed in any Third Party Services or the Bitmark Property System. In addition, Company will not and cannot monitor, verify, censor or edit the content of any Third Party Service or the Bitmark Property System. By using the Services, you expressly relieve and hold harmless Company from any and all liability arising from your use of any Third Party Website or the Bitmark Property System.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Termination.</Text> This Agreement shall remain in full force and effect while you use the Services. You may terminate your use of the Services at any time. Company may terminate or suspend your access to the Services or your account at any time, for any reason, and without warning, which may result in the forfeiture and destruction of all information associated with your account. Company may also terminate or suspend any and all Services and access to the Website immediately, without prior notice or liability, if you breach any of the terms or conditions of this Agreement. Upon termination of your account, your right to use the Services, access the Website, and any Content will immediately cease. Termination of your access to the Services does not affect your account on the Bitmark Property System, only your ability to use the Services to interact with the Bitmark Property System. All provisions of this Agreement that, by their nature, should survive termination, shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, and limitations of liability.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Miscellaneous.</Text> The failure of either party to exercise, in any respect, any right provided for herein shall not be deemed a waiver of any further rights hereunder. Company shall not be liable for any failure to perform its obligations hereunder where such failure results from any cause beyond Company's reasonable control. If any provision of this Agreement is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that this Agreement shall otherwise remain in full force and effect and enforceable. This Agreement is not assignable, transferable or sublicensable by you except with Company's prior written consent. Company may transfer, assign or delegate this Agreement and its rights and obligations without consent. Both parties agree that this Agreement is the complete and exclusive statement of the mutual understanding of the parties and supersedes and cancels all previous written and oral agreements, communications and other understandings relating to the subject matter of this Agreement, and that all modifications must be in a writing signed by both parties, except as otherwise provided herein. No agency, partnership, joint venture, or employment is created as a result of this Agreement and you do not have any authority of any kind to bind Company in any respect whatsoever. Headings for each section have been included above for your convenience, but such headings do not have any legal meaning, and may not accurately reflect the content of the provisions they precede.{'\n\n'}
                <Text style={{ fontWeight: '600' }}>Governing Law; Arbitration.</Text> This Agreement shall be governed by and construed in accordance with the laws of the State of California without regard to the conflict of laws provisions thereof. Any dispute arising from or relating to the subject matter of this Agreement shall be finally settled by arbitration in San Francisco, California in accordance with the Streamlined Arbitration Rules and Procedures of Judicial Arbitration and Mediation Services, Inc. ("JAMS") then in effect. Judgment upon the award so rendered may be entered in a court having jurisdiction, or application may be made to such court for judicial acceptance of any award and an order of enforcement, as the case may be. Notwithstanding the foregoing, each party shall have the right to institute an action in a court of proper jurisdiction for injunctive or other equitable relief pending a final decision by the arbitrator. For all purposes of this Agreement, the parties consent to exclusive jurisdiction and venue in the Superior Court of the City and County of San Francisco, California, and the United States Circuit Court for the Northern District of California located in San Francisco, California.
              </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>COPYRIGHT DISPUTE POLICY</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => {
              if (url.indexOf('@bitmark.com') >= 0) {
                Mailer.mail({ subject: 'Suggestion for Bitmark Health', recipients: [url], }, (error) => {
                  if (error) {
                    Alert.alert('Error', 'Could not send mail.');
                  }
                })
              } else {
                Linking.openURL(url);
              }
            }} >
              <Text style={[styles.contentNormalText]}>Company has adopted the following general policy toward copyright infringement in accordance with the Digital Millennium Copyright Act or DMCA (posted at http://www.copyright.gov/legislation/dmca.pdf). The address of Company's Designated Agent to Receive Notification of Claimed Infringement ("Designated Agent") is listed at the end of this Section. It is Company's policy to (1) block access to or remove material that it believes in good faith to be copyrighted material that has been illegally copied and distributed; and (2) remove and discontinue service to repeat offenders.{'\n'}</Text>
              <Text style={styles.contentNormalText}>
                <Text style={{ fontWeight: '600' }}>Procedure for Reporting Copyright Infringements.</Text> If you believe that material or content residing on or accessible through the Services infringes a copyright, please send a notice of copyright infringement containing the following information to the Designated Agent listed below:{'\n'}
              </Text>

              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>1.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  A physical or electronic signature of a person authorized to act on behalf of the owner of the copyright that has been allegedly infringed;{'\n'}
                </Text>
              </View>

              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>2.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  Specific identification of the copyrighted works or materials being infringed;{'\n'}
                </Text>
              </View>

              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>3.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  Identification of the material that is claimed to be infringing including information regarding the location of the infringing materials that the copyright owner seeks to have removed, with sufficient detail so that Company is capable of finding and verifying its existence;{'\n'}
                </Text>
              </View>

              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>4.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  Contact information about the notifier including address, telephone number and, if available, email address;{'\n'}
                </Text>
              </View>

              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>5.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  A statement that the notifier has a good faith belief that the material identified in (3) is not authorized by the copyright owner, its agent, or the law; and{'\n'}
                </Text>
              </View>
              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>6.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  A statement requesting that Company take a specific act with respect to the alleged infringement (e.g., removal, access restricted or disabled); and{'\n'}
                </Text>
              </View>
              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>7.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  A statement made under penalty of perjury that the information provided is accurate and the notifying party is authorized to make the complaint on behalf of the copyright owner.{'\n'}
                </Text>
              </View>

              <Text style={styles.contentNormalText}>
                Once proper bona fide infringement notification is received by the designated agent, it is Company's policy:{'\n'}
              </Text>
              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>1.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  to remove or disable access to the infringing material;{'\n'}
                </Text>
              </View>
              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>2.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  to notify the content provider, or user that it has removed or disabled access to the material; and{'\n'}
                </Text>
              </View>
              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>3.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  that repeat offenders will have the infringing material removed from the system and that Company will terminate such content provider's or user's access to the Services.{'\n'}
                </Text>
              </View>
              <Text style={styles.contentNormalText}>
                <Text style={{ fontWeight: '600' }}>Procedure to Supply a Counter-Notice.</Text> If the content provider or user believes that the material that was removed (or to which access was disabled) is not infringing, or the content provider or user believes that it has the right to post and use such material from the copyright owner, the copyright owner's agent, or, pursuant to the law, the content provider or user, must send a counter-notice containing the following information to the Designated Agent listed below:{'\n'}
              </Text>
              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>1.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  A physical or electronic signature of the content provider or user;{'\n'}
                </Text>
              </View>
              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>2.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  Identification of the material that has been removed or to which access has been disabled and the location at which the material appeared before it was removed or disabled;{'\n'}
                </Text>
              </View>
              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>3.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  A statement that the content provider or user has a good faith belief that the material was removed or disabled as a result of mistake or misidentification of the material; and{'\n'}
                </Text>
              </View>
              <View style={styles.contentNormalRow}>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(30), paddingRight: 0 }]}>4.</Text>
                <Text style={[styles.contentNormalText, { marginTop: 0, width: convertWidth(345) }]}>
                  Content provider's or user's name, address, telephone number, and, if available, email address, and a statement that such person or entity consents to the jurisdiction of the Federal Court for the judicial district in which the content provider's, member's or user's address is located, or, if the content provider's, member's or user's address is located outside the United States, for any judicial district in which Company is located, and that such person or entity will accept service of process from the person who provided notification of the alleged infringement. If a counter-notice is received by the Designated Agent, Company may send a copy of the counter-notice to the original complaining party informing that person that Company may replace the removed material or cease disabling it in 10 business days. Unless the copyright owner files an action seeking a court order against the content provider, member or user, the removed material may be replaced or access to it restored in 10 to 14 business days or more after receipt of the counter-notice, at Company's discretion.{'\n'}
                </Text>
              </View>

              <Text style={styles.contentNormalText}>
                Please contact Company's Designated Agent to Receive Notification of Claimed Infringement at the following address:{'\n\n'}
                Copyright Agent Bitmark Inc. 1F No.489-1, Chongyang Rd. Nangang Dist., Taipei City 115, Taiwan Email: copyright@bitmark.com
              </Text>
            </Hyperlink>

            <Text style={styles.contentSubTitleText}>CONTACT</Text>
            <Hyperlink linkStyle={{ color: '#0060F2' }} onPress={(url) => {
              if (url.indexOf('@bitmark.com') >= 0) {
                Mailer.mail({ subject: 'Suggestion for Bitmark Health', recipients: [url], }, (error) => {
                  if (error) {
                    Alert.alert('Error', 'Could not send mail.');
                  }
                })
              } else {
                Linking.openURL(url);
              }
            }} >
              <Text style={styles.contentNormalText}>
                If you have any questions, complaints, or claims with respect to the Services, you may contact us at support@bitmark.com.
            </Text>
            </Hyperlink>

          </View>}

        </ View>


        <View style={styles.bottomButtonArea}>
          <TouchableOpacity style={styles.lastBottomButton} onPress={this.shareLegal}>
            <Text style={styles.lastBottomButtonText}>SHARE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingTop: 40,
    paddingBottom: 20,
  },

  swipePageContent: {
    flexDirection: 'column',
    flex: 1,
  },

  contentSubTitleText: {
    width: convertWidth(375),
    fontFamily: 'Avenir black',
    fontSize: 15,
    fontWeight: '900',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingTop: 25,
    paddingBottom: 10,
  },
  contentCreatedText: {
    width: convertWidth(375),
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    fontFamily: 'Avenir Light',
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '300',
  },
  contentNormalRow: {
    flexDirection: 'row',
  },
  contentNormalText: {
    width: convertWidth(375),
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    fontSize: 15,
    fontWeight: '300',
    fontFamily: 'Avenir Light',
    marginTop: 5,
  },

  knowYourRightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: convertWidth(19),
    marginRight: convertWidth(19),
    minHeight: 26,
    borderBottomWidth: 0.3,
    borderBottomColor: '#C1C1C1',
  },
  knowYourRightsRowText: {
    fontSize: 12,
    fontWeight: '300',
    fontFamily: 'Avenir Light',
    lineHeight: 21,
  },

  bottomButtonArea: {
    flexDirection: 'column',
    width: '100%',
  },
  lastBottomButton: {
    height: constants.buttonHeight,
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  lastBottomButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },
});