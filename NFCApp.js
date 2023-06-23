import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, Pressable, Alert,TextInput,Modal, ActivityIndicator, View } from 'react-native';
import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';

const NFCApp = () => {
  const [texto, setTexto] = useState('')
  const [leido, setLeido] = useState('')
  const [escribir, setEscribir] = useState(false)
  const [cargandoEscritura, setCargandoEscritura] = useState(false)
  const [modalLeer, setModalLeer] = useState(false)
  const [focus, setFocus] = useState(false)

  useEffect(() => {
    //Verificar si el NFC esta activo
    const nfc_activo = async ()=>{
      const activo = await NfcManager.isEnabled()
      if(!activo) Alert.alert('NFC desactivado', 'El NFC de tu dispositivo no esta activado, para que la app funcione correctamente necesita estar activo')
    }
    nfc_activo()
   //Iniciar el NFC
    NfcManager.start()

  }, []);

  const readNFC = async () => {
    try {
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.Ndef);
      // the resolved tag object will contain `ndefMessage` property
      const tag = await NfcManager.getTag();
      const msg = String.fromCharCode(...tag.ndefMessage[0].payload)
      setLeido(msg.slice(3))
      //Alert.alert('Mensaje Leído',msg.replace('en', ''))
    } catch (ex) {
      console.log('Oops!', ex);
    } finally {
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
    }

  };

  const writeNFC = async () => {
    setCargandoEscritura(true)
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef)
      const bytes = Ndef.encodeMessage([Ndef.textRecord(texto)])
      await NfcManager.ndefHandler.writeNdefMessage(bytes)
      setCargandoEscritura(false)
      setEscribir(false)
      Alert.alert('Mensaje NFC escrito con éxito', texto);
      NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.log('Error al texto NFC:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Lectura y escritura NFC</Text>
      <Pressable style={[styles.btn,{backgroundColor:'#d5bdaf', width:180}]} onPress={()=>{
        setModalLeer(true)
        readNFC()
        }}>
        <Text style={styles.btnTexto}>Lectura</Text>
      </Pressable>
      <Pressable  style={[styles.btn, {backgroundColor:'#d6ccc2', width:180}]} onPress={()=>setEscribir(true)}>
        <Text style={styles.btnTexto}>Escritura</Text>
      </Pressable>

      <Modal animationType='slide' visible={modalLeer} transparent={true}>
            <View style={styles.contenidoModal}>
              <View style={styles.datosModal}>
              {
                leido ? (
                  <>
                  <Text style={[styles.textoModal, {color:'#22223b', fontWeight:'normal'}]}>Mensaje Leído: <Text style={{fontWeight:'bold'}}>{'\n'+leido}</Text></Text>
                  <Pressable  style={[styles.btn, {marginBottom:10}]} onPress={()=>{
                    setModalLeer(false)
                    setLeido('')
                  }}>
                    <Text style={styles.btnTexto}>Cerrar</Text>
                  </Pressable> 
                  </>
                ) : (
                  <View>
                  <Text style={[styles.textoModal, {color:'#22223b'}]}>Detectando Tarjet NFC para empezar lectura</Text>
                  <ActivityIndicator size={60} color="#22223b" />  
                  </View>
                )
              }
              </View>
            </View>
          </Modal>

          <Modal animationType='slide' visible={escribir} transparent={true}>
            <View style={styles.contenidoModal}>
              <View style={styles.datosModal}>
              {
                !cargandoEscritura ? (
                  <>
                      <TextInput 
                      style={[{marginBottom:20, borderBottomColor:'#ecebe4', borderBottomWidth:1, padding:8, fontSize:17, color:'#22223b'}, focus && {borderBottomColor:'#6d7b8d'}]}
                      placeholder='Escribe el texto que quieras guardar'
                      placeholderTextColor='#8d99ae'
                      onFocus={()=>setFocus(true)}
                      onBlur={()=>setFocus(false)}
                      onChangeText={txt=>setTexto(txt)}
                    />
                  <Pressable  style={[styles.btn, {marginBottom:15}]} onPress={writeNFC}>
                    <Text style={styles.btnTexto}>Guardar</Text>
                  </Pressable> 
                  <Pressable  style={[styles.btn, {marginBottom:10, backgroundColor:'#d6ccc2'}]} onPress={()=>setEscribir(false)}>
                    <Text style={styles.btnTexto}>Cancelar</Text>
                  </Pressable>  
                  </>

                ): 
                (
                  <View>
                    <Text style={[styles.textoModal, {color:'#000', fontWeight:'normal'}]}>Escribiendo <Text style={{fontWeight:'bold'}}>{texto}</Text> en el dispositivo NFC</Text>
                    <ActivityIndicator size={60} color="#1D4F7B" />
                  </View>
                )
              }
              </View>
            </View>
          </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#463f3a'
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color:'#f4f3ee'
  },
  btnTexto:{
    color:'#403d39',
    fontWeight:'500',
    fontSize:25,
    textAlign:'center'
  },
  btn:{
    borderRadius:10,
    paddingVertical:5,
    paddingHorizontal:26,
    marginBottom:29,
    backgroundColor:'#e3d5ca'
  },
  contenidoModal:{
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, .5)',
    paddingHorizontal:5
  },
  datosModal:{
    backgroundColor:'#f4f3ee', 
    alignItems:'center',
    justifyContent:'center',
    borderRadius:20, 
    paddingHorizontal:30, 
    paddingVertical:20,    
    shadowColor: '#000',
    shadowOffset: {
    width: 20,
    height: 20,
  },
  shadowOpacity: 0.50,
  shadowRadius: 4,
  elevation: 5,
},
  textoModal:{
    fontWeight:'bold',
    fontSize:20,
    marginBottom:15,
    textAlign:'center'
  }
});

export default NFCApp;
