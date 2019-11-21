import React, {Component, createRef} from 'react';
import logo from './logo.svg';
// @ts-ignore
import WaveSurfer from 'wavesurfer.js';
import './App.css';
import { Decoder, BufferManipulations, Encoder } from 'alamp';

export default class App extends Component<{}, {audio: string | undefined}> {
    wavesurfer: any;
    containerRef: any;

    constructor(props: {}) {
        super(props);
        this.state = {
            audio: undefined
        };
        this.containerRef = createRef();
    }

    componentDidMount(): void {
        this.wavesurfer = WaveSurfer.create({
            container: this.containerRef.current,
            waveColor: 'violet',
            progressColor: 'purple'
        });
        this.wavesurfer.on('ready', ()  => {
            this.wavesurfer.play();
        });
    }

    async handleChange(selectorFiles: FileList)
    {
        // Aqui leo el archivo que subí
        const file: File = selectorFiles.item(0) as File;
        console.log(file);

        const decoder = new Decoder();
        // Lo decodifico, para poder cortarlo
        const buf = await decoder.decodeFile(file);
        // Esta clase recibe el audio decodificado y permite hacer algunas modificaciones
        const manipulator = new BufferManipulations(buf);
        // Crop a piece of audio. From 1st second to 5th second.
        manipulator.cut(1000, 5000);
        // Apply cuts and fades and get modified buffer.
        const processedBuffer = await manipulator.apply();

        const encoder = new Encoder();
        // Encode modified buffer to MP3 data. Este es el blob que deberia cargarse en el wave
        const blob = await encoder.encodeToMP3Blob(processedBuffer, 196);

        // Your file blob is ready here. Esta es una url del blob que utilizo par poder descargar el archivo
        this.setState({audio: URL.createObjectURL(blob)});

        // Aqui cargo el audio a wavesurfer como un blob, ya solo seria configurar el espectrograma y eso, pero si funciona
        this.wavesurfer.loadBlob(blob);
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <input type="file" onChange={ (e: any) => {this.handleChange(e.target.files)} } />
                    <a href={this.state.audio} download> Download CV (esto es un boton, descarga el archivo)</a>
                </header>
                <div id="waveform" ref={this.containerRef}></div>
            </div>
        );
    }
}
