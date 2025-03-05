import express, { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { processJsonData } from '../utils/json-helper';
import { JsonEntity } from '../model/entity-model';
import { Association } from '../model/association-model';
import { ProcessedData } from '../model/processedData-model';
import { createDomainModelFromSelectedEntitysAndAttributes } from '../sdk/generateRFCModule';
import path from 'path';
import fs from 'fs';
import { getCounter } from '../public/counter';
import { Constants } from '../model/mxconstants-model';
import { ConfigTokenAndName } from '../public/config';
import { MendixPlatformClient } from 'mendixplatformsdk';

const generatorRouter: Router = express.Router();
let lastReceivedJson: unknown | null = null;
let processedData: ProcessedData | null = null;
let selectedData: ProcessedData | null = null;
let entities: JsonEntity[] = [];
let associations: Association[] = [];
let constants: Constants | null = null;
let isNewAppNeeded: boolean = false;

async function generateMpkFileWithProgress(progressCallback: (progress: number) => void): Promise<void> {
  try {
      let progress = 0;

      const steps = 10;
      for (let i = 1; i <= steps; i++) {
          await new Promise<void>((resolve) => setTimeout(resolve, 1000)); // Simuliert eine lange Operation

          progress = Math.min((i / steps) * 100, 100);

          progressCallback(progress);
      }
  } catch (error) {
      console.error('Error during MPK file generation:', error);
      throw error;
  }
}

generatorRouter.get('/progress', (req: Request, res: Response): void => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
      generateMpkFileWithProgress((progress: number) => {
          res.write(`data: ${progress}\n\n`);
          if (progress >= 100) {
              res.end();
          }
      }).catch((error: Error) => {
          console.error('Error during MPK file generation:', error);
          res.write('data: error\n\n');
          res.end();
      });
  } catch (error) {
      console.error('Error in progress route:', error);
      res.write('data: error\n\n');
      res.end();
  }
});



generatorRouter.post('/create', (req, res) => {
  try {
    const jsonFile = req.body;

    if (!jsonFile || Object.keys(jsonFile).length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Domain Model could not be generated, body empty' });
    }

    lastReceivedJson = jsonFile;
    const result = processJsonData(jsonFile);

    if (result) {
      processedData = result;
      entities = processedData.entities;
      associations = processedData.associations;

      res.status(StatusCodes.OK).json({ message: 'Domain Model received successfully' });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to process data' });
    }
  } catch (error) {
    console.error('Error processing JSON:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
});

generatorRouter.get('/data', (req, res) => {
  try {
    if (!processedData) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No domain model has been received yet' });
    }
    res.status(StatusCodes.OK).json(lastReceivedJson);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
});

generatorRouter.get('/entities', (req, res) => {
  try {
    if (!entities || entities.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'No entities have been received yet' });
    }
    res.status(StatusCodes.OK).json(entities);
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
});

function filterAssociations(allAssociations: Association[], selectedEntities: JsonEntity[]): Association[] {
  let filteredAssociations: Association[] = [];

  allAssociations.forEach(association => {
    const fromEntityExists = selectedEntities.some(e => e.name === association.fromEntity);
    const toEntityExists = selectedEntities.some(e => e.name === association.toEntity);

    if (fromEntityExists && toEntityExists) {
      filteredAssociations.push(association);
    }
  });

  return filteredAssociations;
}



generatorRouter.post('/submit-selection', async (req, res) => {
  try {
    const selectedEntities: JsonEntity = req.body;

    if (!selectedEntities || !Array.isArray(selectedEntities)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid selection data' });
    }

    const filteredAssociations = await filterAssociations(associations, selectedEntities);
    const filteredAssociationsWithEntitys: ProcessedData = { associations: filteredAssociations, entities: selectedEntities };

    await createDomainModelFromSelectedEntitysAndAttributes(filteredAssociationsWithEntitys, isNewAppNeeded, constants);

    processedData = null;
    entities = [];
    associations = [];
    isNewAppNeeded = false;
    constants = null;
    res.status(StatusCodes.OK).json({ message: 'Selection submitted successfully' });
  } catch (error) {
    console.error('Error submitting selection:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
});

generatorRouter.get('/download-mpk', (req, res) => {
  const directoryPath = path.join(__dirname, '../');

  fs.readdir(directoryPath, async (err, files) => {
      if (err) {
          console.error('Unable to scan directory:', err);
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Unable to scan directory.');
      }

      const mpkFiles = files.filter(file => path.extname(file) === '.mpk' && file.includes(`_${getCounter() - 1}.mpk`));

      if (mpkFiles.length === 0) {
          return res.status(StatusCodes.NOT_FOUND).send('No MPK file found.');
      }

      const mpkFilePath = path.join(directoryPath, mpkFiles[0]);
      const myReadStream = fs.createReadStream(mpkFilePath);
      let streamClosed = false;

      const closeStream = () => {
          if (!streamClosed) {
              myReadStream.close();
              streamClosed = true;
          }
      };

      myReadStream.on('open', () => {
          res.download(mpkFilePath, mpkFiles[0], (err) => {
              if (err) {
                  console.error('Failed to download file:', err);
                  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Failed to download file.');
              } else {
                  console.log('File downloaded successfully');

                  fs.rm(mpkFilePath, { force: true }, (unlinkErr) => {
                      if (unlinkErr) {
                          console.error('Failed to delete file:', unlinkErr);
                      } else {
                          console.log('File deleted successfully');
                      }
                  });
              }
              closeStream();
          });
      });

      myReadStream.on('error', (err) => {
          console.error('Stream error:', err);
          closeStream();
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Failed to download file.');
      });

      res.on('close', () => {
          closeStream();
      });

  });
});



generatorRouter.get('/', (req, res) => {
  try {
    res.status(StatusCodes.OK).json({ message: 'Working' });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
});

export default generatorRouter;
