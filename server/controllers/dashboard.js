import * as fs from 'node:fs';
import moment from 'moment';

const filePath = './dashboard-table.json';
const graphFilePath = './dashboard-graph.json';

function appendToFile(path, dashboardName) {
  let jsonArr = [];
  let total;

  if (fs.existsSync(path)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const fileContentJson = (fileContent === '') ? '' : JSON.parse(fileContent);
    jsonArr = (fileContent === '') ? [] : fileContentJson.objects;
    total = (fileContent === '') ? 1 : fileContentJson.total + 1;
  }
  console.log(total);
  const newObj = {
    id: total,
    name: dashboardName,
    createDate: moment().format('YYYY-MM-DD HH:mm:ss(Z)'),
  };
  console.log(newObj);

  jsonArr.push(newObj);

  const data = {
    objects: jsonArr,
    total,
  };

  fs.writeFile(path, JSON.stringify(data, null, 1), (error) => {
    if (error) {
      console.error('Error writing to file', error);
    }
  });
  return data;
}

function deleteGraph(id, graph) {
  let dataJson;
  let newData;

  const data = fs.readFileSync(graphFilePath, 'utf-8', (error) => {
    if (error) {
      console.error('Error reading file:', error);
    }
  });

  try {
    dataJson = JSON.parse(data);
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }

  if (graph === 'all') {
    newData = dataJson.filter((object) => (object.id !== Number(id)));
  } else {
    newData = dataJson.filter((object) => (object.id === Number(id) && object.item !== graph));
  }

  fs.writeFile(graphFilePath, JSON.stringify(newData, null, 1), (error) => {
    if (error) {
      console.error('Error writing to file', error);
    }
  });

  return newData;
}

export function saveDashboardTable (req, res) {
  try {
    const data = req.body;
    const newData = JSON.parse(data.body);
    const dashboardName = newData.inputValue;

    if (!dashboardName || !dashboardName.trim()) return res.status(400).json({ message: 'Dashboard name cannot be empty' });
    if (dashboardName.length > 30) return res.status(400).json({ message: 'Dashboard name should not exceed 30 characters' });

    const newObj = appendToFile(filePath, dashboardName);
    return res.status(200).json(newObj);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Save dashboard failed' });
  }

}

export function readDashboardTable(req, res) {
  if (!fs.existsSync(filePath)) {
    return res.json([]);
  }

  const jsonArr = fs.readFileSync(filePath, 'utf-8');
  if (jsonArr.length === 0 || jsonArr === '') return res.json([]);
  return res.json(JSON.parse(jsonArr));
}

export function deleteDashboardTable(req, res) {
  try {
    const { id } = req.params;
    if (id === undefined || Number.isNaN(Number(id))) {
      return res.status(400).json({ message: 'Your delete action is invalid' });
    }

    const data = fs.readFileSync(filePath, 'utf-8', (error) => {
      if (error) {
        console.error('Error reading file:', error);
      }
    });
    let dataJson;
    let objects;
    let total;

    try {
      dataJson = JSON.parse(data);
      objects = dataJson.objects;
      total = dataJson.total;
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
    const newobjects = objects.filter((item) => item.id !== Number(id));
    const newData = {
      objects: newobjects,
      total,
    };

    fs.writeFile(filePath, JSON.stringify(newData, null, 1), (error) => {
      if (error) {
        console.error('Error writing to file', error);
      }
    });

    deleteGraph(id, 'all');

    return res.status(200).json(newData);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
}

export function getDashboardDetail(req, res) {
  const { id } = req.params;
  if (!fs.existsSync(filePath)) {
    return res.json([]);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  if (fileContent.length === 0 || fileContent === '') return res.json([]);

  const fileContentJson = JSON.parse(fileContent);
  const detailObject = fileContentJson.objects.find((item) => item.id === Number(id)); // 只會有一筆
  return res.json(detailObject);
}

export function addDashboardGraph(req, res) {
  try {
    const { id } = req.params;
    const { body } = req.body;
    const { item } = JSON.parse(body);
    const { type } = JSON.parse(body);
    let newArr = [];

    const newGraph = {
      id: Number(id),
      item,
      type,
    };

    if (!fs.existsSync(graphFilePath)) {
      return res.status(500).json({ message: 'Graph file not exist' });
    }

    const fileContent = fs.readFileSync(graphFilePath, 'utf-8');
    const fileContentJson = (fileContent === '') ? '' : JSON.parse(fileContent);
    newArr = (fileContentJson === '') ? [] : fileContentJson;

    newArr.push(newGraph);

    fs.writeFile(graphFilePath, JSON.stringify(newArr, null, 1), (error) => {
      if (error) {
        console.error('Error writing graph', error);
      }
    });

    return res.json('');
  } catch (error) {
    return res.status(500).json({ message: 'Graph is not able to be saved' });
  }
}

export function getDashboardGraph(req, res) {
  const { id } = req.params;
  if (!fs.existsSync(graphFilePath)) {
    return res.json([]);
  }

  const fileContent = fs.readFileSync(graphFilePath, 'utf-8');
  if (fileContent.length === 0 || fileContent === '') return res.json([]);
  console.log(fileContent);
  const fileContentJson = JSON.parse(fileContent);
  const graphObject = fileContentJson.filter((item) => item.id === Number(id));
  return res.json(graphObject);
}

export function deleteDashboardGraph(req, res) {
  const { id, graphName } = req.params;

  if (!fs.existsSync(graphFilePath)) {
    return res.json([]);
  }

  if (id === undefined || Number.isNaN(Number(id))) {
    return res.status(400).json({ message: 'Your delete action is invalid' });
  }

  const newData = deleteGraph(id, graphName);

  return res.status(200).json(newData);

}
