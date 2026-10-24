import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Platform, SafeAreaView } from 'react-native';

const DB = {
  get: (k) => { try { const v = Platform.OS === 'web' ? localStorage.getItem(k) : null; return v ? JSON.parse(v) : []; } catch { return []; } },
  set: (k, v) => { try { if (Platform.OS === 'web') localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [props, setProps] = useState([]);
  const [sel, setSel] = useState(null);
  const [agentName, setAgentName] = useState('');

  useEffect(() => { setProps(DB.get('props')); }, []);
  const save = (p) => { setProps(p); DB.set('props', p); };

  if (screen === 'home') return (
    <SafeAreaView style={s.c}>
      <Text style={s.h1}>🏠 मालमत्ता ॲप</Text>
      <Text style={s.sub}>जमीन • जागा • फ्लॅट</Text>
      <TouchableOpacity style={s.btn} onPress={() => setScreen('owner')}>
        <Text style={s.btnT}>👤 मी मालक आहे</Text>
        <Text style={s.btnSub}>मालमत्ता अपलोड करा</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.btn, s.btnGreen]} onPress={() => setScreen('agentLogin')}>
        <Text style={s.btnT}>💼 मी एजंट आहे</Text>
        <Text style={s.btnSub}>मालमत्ता पाहा व काम करा</Text>
      </TouchableOpacity>
      <Text style={s.foot}>एकूण मालमत्ता: {props.length}</Text>
    </SafeAreaView>
  );

  if (screen === 'owner') return <Owner props={props} onAdd={(p) => save([...props, p])} onBack={() => setScreen('home')} />;

  if (screen === 'agentLogin') return (
    <SafeAreaView style={s.c}>
      <TouchableOpacity onPress={() => setScreen('home')}><Text style={s.back}>← मागे</Text></TouchableOpacity>
      <Text style={s.h2}>एजंट लॉगिन</Text>
      <Text style={s.lbl}>तुमचे नाव</Text>
      <TextInput style={s.in} value={agentName} onChangeText={setAgentName} placeholder="उदा. राहुल पाटील" />
      <TouchableOpacity style={s.btn} onPress={() => { if (!agentName) { Alert.alert('नाव भरा'); return; } setScreen('agent'); }}>
        <Text style={s.btnT}>पुढे जा →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  if (screen === 'agent') return (
    <Agent props={props} agentName={agentName} onSel={(p) => { setSel(p); setScreen('detail'); }} onBack={() => setScreen('home')} />
  );

  if (screen === 'detail' && sel) return (
    <Detail p={sel} agentName={agentName} props={props} onUpdate={(np) => { const all = props.map(x => x.id === np.id ? np : x); save(all); setSel(np); }} onBack={() => setScreen('agent')} />
  );

  return null;
}

function Owner({ props, onAdd, onBack }) {
  const [type, setType] = useState('जमीन');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [price, setPrice] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const submit = () => {
    if (!city || !price || !name || !phone) { Alert.alert('भरा', 'सर्व माहिती भरा'); return; }
    onAdd({ id: Date.now(), type, city, area, price, name, phone, agentName: null, status: 'available' });
    Alert.alert('✅ झाले', 'मालमत्ता अपलोड झाली!');
    setCity(''); setArea(''); setPrice(''); setName(''); setPhone('');
  };

  return (
    <SafeAreaView style={s.c}>
      <TouchableOpacity onPress={onBack}><Text style={s.back}>← मागे</Text></TouchableOpacity>
      <ScrollView>
        <Text style={s.h2}>मालमत्ता अपलोड करा</Text>
        <Text style={s.lbl}>प्रकार</Text>
        <View style={s.row}>
          {['जमीन','जागा','फ्लॅट'].map(t => (
            <TouchableOpacity key={t} style={[s.chip, type===t && s.chipOn]} onPress={() => setType(t)}>
              <Text style={type===t ? s.chipTOn : s.chipT}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.lbl}>शहर, जिल्हा</Text>
        <TextInput style={s.in} value={city} onChangeText={setCity} placeholder="उदा. पुणे, पुणे जिल्हा" />
        <Text style={s.lbl}>क्षेत्रफळ</Text>
        <TextInput style={s.in} value={area} onChangeText={setArea} placeholder="उदा. २ गुंठे" />
        <Text style={s.lbl}>किंमत (₹ लाख)</Text>
        <TextInput style={s.in} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="उदा. 15" />
        <Text style={s.lbl}>तुमचे नाव</Text>
        <TextInput style={s.in} value={name} onChangeText={setName} placeholder="सुनील देशमुख" />
        <Text style={s.lbl}>मोबाईल</Text>
        <TextInput style={s.in} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="98XXXXXXXX" />
        <TouchableOpacity style={s.btn} onPress={submit}><Text style={s.btnT}>✅ अपलोड करा</Text></TouchableOpacity>
        <Text style={s.note}>टीप: नंबर फक्त कॉल स्वीकारणाऱ्या एजंटलाच दिसेल</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Agent({ props, agentName, onSel, onBack }) {
  return (
    <SafeAreaView style={s.c}>
      <TouchableOpacity onPress={onBack}><Text style={s.back}>← मागे</Text></TouchableOpacity>
      <Text style={s.h2}>मालमत्ता यादी</Text>
      <Text style={s.sub}>एजंट: {agentName}</Text>
      <ScrollView>
        {props.length === 0 && <Text style={s.empty}>अजून कोणतीही मालमत्ता नाही</Text>}
        {props.map(p => (
          <TouchableOpacity key={p.id} style={s.card} onPress={() => onSel(p)}>
            <Text style={s.cardT}>{p.type} — {p.city}</Text>
            <Text style={s.cardS}>{p.area} | ₹{p.price} लाख</Text>
            {p.agentName ? (
              <Text style={s.cardA}>👤 {p.agentName} हाताळत आहेत</Text>
            ) : (
              <Text style={s.cardB}>📞 उपलब्ध — कॉल स्वीकारा</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ p, agentName, onUpdate, onBack }) {
  const isMine = p.agentName === agentName;
  const claim = () => {
    const updated = { ...p, agentName: agentName, status: 'claimed' };
    onUpdate(updated);
    Alert.alert('✅ कॉल स्वीकारला', `मालक: ${p.name}\n📞 ${p.phone}`);
  };

  return (
    <SafeAreaView style={s.c}>
      <TouchableOpacity onPress={onBack}><Text style={s.back}>← मागे</Text></TouchableOpacity>
      <ScrollView>
        <Text style={s.h2}>{p.type} — {p.city}</Text>
        <Text style={s.det}>{p.area} | ₹{p.price} लाख</Text>
        {!p.agentName && (
          <View style={s.box}>
            <Text style={s.lbl}>🔒 मालकाचा नंबर लपलेला</Text>
            <TouchableOpacity style={s.btn} onPress={claim}>
              <Text style={s.btnT}>📞 कॉल स्वीकारा</Text>
            </TouchableOpacity>
            <Text style={s.note}>स्वीकारल्यावर नंबर लगेच दिसेल</Text>
          </View>
        )}
        {p.agentName && isMine && (
          <View style={s.box}>
            <Text style={s.ok}>✅ तुम्ही हे हाताळत आहात</Text>
            <Text style={s.lbl}>मालक: {p.name}</Text>
            <Text style={s.big}>📞 {p.phone}</Text>
            <Text style={s.note}>इतरांना हा नंबर दिसत नाही</Text>
          </View>
        )}
        {p.agentName && !isMine && (
          <View style={s.box}>
            <Text style={s.lbl}>👤 हाताळणारा एजंट:</Text>
            <Text style={s.h3}>{p.agentName}</Text>
            <Text style={s.note}>🔒 मालकाचा नंबर फक्त त्यांना दिसतो</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f5f5f7', padding: 20, paddingTop: 40 },
  h1: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginTop: 40 },
  h2: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  h3: { fontSize: 20, fontWeight: 'bold', color: '#2563eb', marginTop: 4 },
  sub: { textAlign: 'center', color: '#666', marginBottom: 30, fontSize: 15 },
  lbl: { fontSize: 14, color: '#444', marginTop: 12, marginBottom: 6, fontWeight: '600' },
  in: { backgroundColor: '#fff', padding: 14, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  btn: { backgroundColor: '#2563eb', padding: 18, borderRadius: 12, marginTop: 16 },
  btnGreen: { backgroundColor: '#059669' },
  btnT: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 18 },
  btnSub: { color: '#fff', textAlign: 'center', fontSize: 13, marginTop: 4 },
  back: { color: '#2563eb', fontSize: 16, marginBottom: 16, fontWeight: '600' },
  foot: { textAlign: 'center', color: '#888', marginTop: 40 },
  row: { flexDirection: 'row', gap: 8 },
  chip: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', flex: 1 },
  chipOn: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipT: { textAlign: 'center', color: '#333', fontWeight: '600' },
  chipTOn: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  cardT: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  cardS: { color: '#555', marginTop: 6, fontSize: 15 },
  cardA: { color: '#d97706', marginTop: 10, fontWeight: '700' },
  cardB: { color: '#059669', marginTop: 10, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
  det: { fontSize: 18, color: '#333', marginBottom: 20 },
  box: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginTop: 12 },
  ok: { color: '#059669', fontWeight: 'bold', fontSize: 17, marginBottom: 12 },
  big: { fontSize: 22, fontWeight: 'bold', color: '#2563eb', marginTop: 8 },
  note: { fontSize: 13, color: '#888', marginTop: 12, textAlign: 'center' },
});
