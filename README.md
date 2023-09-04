# TO-DO

# MyFirstToDoProject
  1. Naredi GIT PROJEKT - MyFirstLogiInProject:
        - Deli celotno zadevo z mano, tako kot si v prejšnji nalogi na gitu
        - Drži se GIT logike čez celotno delo in sicer večkrat commitaj in v message napiši za katero funkcionalnost se gre ko je koda pushana
  2. Naredi sledeče:
        - Simple log in v spletno stran:
        - Pozdravi te login stran, ki ima obvezno uporabniško ime in geslo
        - Login stran naj vsebuje gumb za nov vpis v spletno stran - torej formo s katero vneseš podatke v bazo da se prijaviš na spletno stran - TO JE REGISTRACIJA V PORTAL
        - Registracija naj preveri tvoj mail, če je prave oblike
        - Registracija naj pogojuje vpis z "močnim geslom" kar pomeni x > 8 črk in naj pogojuje en poseben znak in vsaj eno veliko črko in številko
        - Geslo je nato naj heshirano in zaščiteno z "secert"
        - Nato ko je registracija izpolnjena se vpišeš lahko v spletno stran
        - Login naj vrne error toaster message v primeru, da je bilo uporabniško ime in geslo napačno
        - Na gui pri vpisu dodelaj še, da lahko pogleda vsak svoj password
        - Tam se nato, ko si vpisan pokaže samo naslov Welcome in spodaj prikaži vsa uporabniška imena kadarkoli vpisanih (simple get function)
        - Lahko se prikaže nato še toaster Dobrodošli v programu
    
  3. Dopolnilne naloge (2. 8. 2023):
     -  Pod TO DO-ji dodaj datum nastanka (naj bo kot metadata, se lahko prikaže kasneje če bo potrebno), rok poteka opravila
     -  Opravila se naj obarvajo rdeče ko preteče rok
     -  Naredi gumb, ki bo ustvaril seznam opravil, pod katerega bodo spadala opravila
     -  Naredi filtre za rok opravila, tag, naslov, seznam opravil
     -  Pri registraciji in prijavi hashaj geslo kar takoj preden pošlješ na API, da podatki ne bodo vidni v payloadu na browserju
    
  4. Dopolnilne naloge (21. 8. 2023)
     -Incript password zardai payload
     -Tooltips
     -Live opozorila pri registraciji in prijavi
     -Datum kdaj je bilo opravilo dokončano
     -Filter "Dokončano" v frontend
     -Jasnost v filtrih
     
  6. Dopolnilne naloge (28. 8. 2023)
      - Dodajanje izpisa roka opravila po odkljukanem opravilu. Torej sta razvidna datum zaključka in rok opravila.
      - Navbar unification, ena vrstica z gumbi, dropdowni...
      - Izbira knjižnice visualizacije podatkov (chart.js, D3, izberi sam, preglej in debatirava naslednjič o izbiri)
      - Grafi bodo sledeči: (primer knjižnice - https://apexcharts.com/)
            - Opravljena/neopravljena opravila stolpični diagram po mescih (zadnji trije), smiselne barve glede na status opravila
            - Procent uspešnosti tekočega meseca (pazi na ničelne vrednosti, ko je število vseh 0)
            - Najhitrejše zaključena opravila, katera, pod katero kategorijo spada, kdaj nsarejena in kdaj zaključena in ali so bila zaključena v roku.
  7. Dopolnilne naloge (4. 9. 2023) //2 tedna časa ali ko končaš, napiši Žigi
        - Reminderji - cronjob, nek scheduler, ki preverja roke nalog, reminderje lahko user nastavi sam. Če ga ne nastavi ga ni. Lahko jih tudi pogleda na ločeni podstrani, vsi reminderji razvrščeni po datumu (logični izpis)
        - Dodajanje datotek k nalogi. Prav tako dodana funkcionalnost za prenos teh datotek.
        - Ponavljajoče naloge - dnevno (delovni dnevi, vikend, custom), tedensko, mesečno, letno.
        - Dopolni točko 4. !!!!!!!
