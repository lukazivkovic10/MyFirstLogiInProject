# MyFirstLogiInProject
1. Naredi GIT PROJEKT - MyFirstLogiInProject
    a. Deli celotno zadevo z mano, tako kot si v prejšnji nalogi na gitu
    b. Drži se GIT logike čez celotno delo in sicer večkrat commitaj in v message napiši za katero funkcionalnost se gre ko je koda pushana
  2. Naredi sledeče:
    a. Simple log in v spletno stran:
      i. Pozdravi te login stran, ki ima obvezno uporabniško ime in geslo
      ii. Login stran naj vsebuje gumb za nov vpis v spletno stran - torej formo s katero vneseš podatke v bazo da se prijaviš na spletno stran - TO JE REGISTRACIJA V PORTAL
        1) Registracija naj preveri tvoj mail, če je prave oblike
        2) Registracija naj pogojuje vpis z "močnim geslom" kar pomeni x > 8 črk in naj pogojuje en poseben znak in vsaj eno veliko črko in številko
        3) Geslo je nato naj heshirano in zaščiteno z "secert"
      iii. Nato ko je registracija izpolnjena se vpišeš lahko v spletno stran
        1) Login naj vrne error toaster message v primeru, da je bilo uporabniško ime in geslo napačno
        2) Na gui pri vpisu dodelaj še, da lahko pogleda vsak svoj password
      iv. Tam se nato, ko si vpisan pokaže samo naslov Welcome in spodaj prikaži vsa uporabniška imena kadarkoli vpisanih (simple get function)
        1) Lahko se prikaže nato še toaster Dobrodošli v programu
    
  3. Dopolnilne naloge (2. 8. 2023):
     a. Pod TO DO-ji dodaj datum nastanka (naj bo kot metadata, se lahko prikaže kasneje če bo potrebno), rok poteka opravila
     b. Opravila se naj obarvajo rdeče ko preteče rok
     c. Naredi gumb, ki bo ustvaril seznam opravil, pod katerega bodo spadala opravila
     d. Naredi filtre za rok opravila, tag, naslov, seznam opravil
     e. Pri registraciji in prijavi hashaj geslo kar takoj preden pošlješ na API, da podatki ne bodo vidni v payloadu na browserju
     
