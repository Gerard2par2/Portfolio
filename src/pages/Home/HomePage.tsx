import "./HomePage.css"
import { faGitlab, faGithub, faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { library, SizeProp } from "@fortawesome/fontawesome-svg-core";
import Section from "../../components/Section";
import CopyPopup from '../../components/popups/copyPopup/CopyPopup';
import { useRef } from "react";
library.add(faGithub,faGitlab,faEnvelope);

export function HomePage(){
    interface CopyPopupRefType{
        displayPopup():void;
    }
    
    const popupRef = useRef<CopyPopupRefType>();
    const contactMailClick = (e:Event) => {
        e.preventDefault();
        if(popupRef.current)popupRef.current.displayPopup();
    }
    return (
        <main id="homeRoot">
            <Section id="git" title1='Découvrez mes projets' links ={[
                {route:'https://forge.univ-lyon1.fr/p2102858',text:'GitLab',icon:faGitlab,iconSize:'2x' as SizeProp},
                {route:'https://github.com/Gerard2par2',text:'GitHub',icon:faGithub,iconSize:'2x' as SizeProp},]}
            ></Section>

            <Section id='about' title1 ='Simon Menard' title2 = 'Etudiant en informatique' links={[
                {route:'./?page=about',text:"Plus d'informations >>"}]}
            ></Section>

            <Section id='contact' title1="Contacts" links={[
                {id:'mail',route:'./',text:'simon.menardp03@gmail.com',icon:faEnvelope ,onClickEvent:contactMailClick as any},
                {id:'discord', route:'./',text:'[Insert discord user code]', icon:faDiscord}
            ]}childrenNodes={[<CopyPopup ref={popupRef}></CopyPopup>]}
            ></Section>
        </main>
    );
}