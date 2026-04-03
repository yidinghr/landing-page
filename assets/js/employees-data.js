(function () {
  const DEFAULT_INTERFACE_TITLE = "弈鼎員工";
  const DEFAULT_INTERFACE_SUBTITLE = "點擊部門切換名單，拖曳即可重新排序。";
  const DEFAULT_IMAGE_SRC = "../image/logo.png";
  const STORAGE_KEY = "yiding_employees_module_state_v3_airtable_import";

  const DEFAULT_DEPARTMENTS = [
  {
    "id": "dept-operation",
    "name": "Operation"
  },
  {
    "id": "dept-cage",
    "name": "Cage"
  },
  {
    "id": "dept-booking-and-service",
    "name": "Booking & Service"
  },
  {
    "id": "dept-finance",
    "name": "Finance"
  },
  {
    "id": "dept-marketing",
    "name": "Marketing"
  },
  {
    "id": "dept-hr",
    "name": "Hr"
  }
];

  const RETIRED_DEPARTMENT = {"id":"dept-retired","name":"離職","fixed":true};

  const BASE_DEPARTMENT_OPTIONS = [
  "Operation",
  "Cage",
  "Booking & Service",
  "Finance",
  "Marketing",
  "Hr",
  "其他"
];

  const POSITION_OPTIONS = [
  "Head of Dept",
  "Dept Manager",
  "Supervisor",
  "Acting Supervisor",
  "Staff"
];

  const TITLE_JOB_OPTIONS = [
  "Head of Operation",
  "Head of Cage",
  "SVC Man",
  "Finance",
  "MKT-Korean",
  "Hr Admin",
  "Host",
  "Cage",
  "Booking",
  "Service",
  "Driver",
  "Admin",
  "其他"
];

  const SEX_OPTIONS = ["男","女","其他"];
  const STATUS_OPTIONS = ["在職","離職"];
  const RELATIONSHIP_OPTIONS = [
  "夫妻",
  "母亲",
  "兄弟",
  "姐妹",
  "姑姑",
  "朋友",
  "父亲",
  "女儿",
  "Bạn",
  "HUSBAND",
  "SISTER",
  "MOM",
  "DADDY",
  "其他"
];
  const ROOM_TYPE_OPTIONS = ["員工宿舍"];
  const PHONE_COUNTRY_OPTIONS = [
  "越南 +84",
  "澳門 +853",
  "台灣 +886",
  "香港 +852",
  "中國 +86",
  "韓國 +82",
  "菲律賓 +63",
  "寮國 +856",
  "柬埔寨 +855",
  "馬來西亞 +60",
  "日本 +81"
];

  const SORT_OPTIONS = [
  {
    "id": "createdAsc",
    "label": "依新增順序"
  },
  {
    "id": "positionDesc",
    "label": "依職位高至低"
  },
  {
    "id": "positionAsc",
    "label": "依職位低至高"
  },
  {
    "id": "onboardOldest",
    "label": "依入職最早"
  },
  {
    "id": "onboardNewest",
    "label": "依入職最新"
  },
  {
    "id": "ageAsc",
    "label": "依年齡由小至大"
  },
  {
    "id": "ageDesc",
    "label": "依年齡由大至小"
  },
  {
    "id": "retiredSoonest",
    "label": "依離職最早"
  }
];

  const CARD_FIELD_OPTIONS = [
  {
    "id": "vieName",
    "label": "越文姓名"
  },
  {
    "id": "engName",
    "label": "英文姓名"
  },
  {
    "id": "ydiId",
    "label": "弈鼎編號"
  },
  {
    "id": "haId",
    "label": "HA 編號"
  },
  {
    "id": "position",
    "label": "職位"
  },
  {
    "id": "titleJob",
    "label": "職務"
  },
  {
    "id": "phoneNumber",
    "label": "電話號碼"
  },
  {
    "id": "dateOfBirth",
    "label": "出生日期"
  },
  {
    "id": "onboardDate",
    "label": "入職日期"
  },
  {
    "id": "nationality",
    "label": "國籍"
  },
  {
    "id": "status",
    "label": "狀態"
  },
  {
    "id": "lastDay",
    "label": "最後工作日"
  }
];

  const SEED_EMPLOYEES = [
  {
    "id": "employee-001",
    "createdAt": 1,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "QUÁCH QUÂN HẠO",
      "engName": "JIMSTER",
      "ydiId": "YDI0001",
      "haId": "",
      "sex": "男",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "Taiwan",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "台灣 +886",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "台灣 +886",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Head of Dept",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-002",
    "createdAt": 2,
    "departmentId": "dept-cage",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "TRẦN MẪN HOA",
      "engName": "KEN",
      "ydiId": "YDI0027",
      "haId": "T-ITO 001",
      "sex": "男",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "Macau",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "澳門 +853",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "澳門 +853",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Head of Dept",
      "titleJob": {
        "preset": "Head of Cage",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "離職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-003",
    "createdAt": 3,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/OBcA8MggKhgtJ6iEVmdJOw/N9fhnkQyu3gmai67PHoYSRcKQMy070DJfPqNHJvRVjb8CMrpXC0wKAjwGRj9LwNou-s22uhhSQ5Qo3kPCexGXyahY4NNOtLVIJXMmOoH50Pg8e0N7wRwP8NfT-E1eoQF8W5Q_WQLlm3jvIKna7Fbhw/i9AEHyFsof4HV0Dg8C53P_h3DSLAKeQ5WLmD7r3iWd8",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN THỊ KIM TRANG",
      "engName": "CANDY",
      "ydiId": "YDI0003",
      "haId": "ITO 1230",
      "sex": "女",
      "dateOfBirth": {
        "year": "1992",
        "month": "09",
        "day": "16"
      },
      "age": "33",
      "zodiac": "Virgo ♍",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(070) 853-8886"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(039) 695-5844"
      },
      "emergencyRelationship": {
        "preset": "夫妻",
        "other": ""
      },
      "email": "ydisvcbooking@gmail.com",
      "nationId": "079192028489",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Dept Manager",
      "titleJob": {
        "preset": "SVC Man",
        "other": ""
      },
      "directBoss": "Toni",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21017"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-003",
          "name": "Candy inf.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/Ftju8iR-xszaWjO_DVJe2A/0N3G7O2gIRd6Rh2BnSnMVjwGdhomKBP2tK2Tis1kLR2hbNclj_jaY5Iho41Zh1KcNnIBTldNOYklALPO1hlLzCs5Snpti_a5ylynUaDqV9S1vdrxhHnHEB3FMyJCmfyqfbGtMb2LFlk-wsKjOc3YueYTnhbw9DX1_Pxg3eY8SZc/6myKfi4a55fFK4ohpbfhTTpSzzGPtYdLZ5iJYJa_CtQ"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-004",
    "createdAt": 4,
    "departmentId": "dept-finance",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/CSzk7LIAHjmH-iblEqgLsw/Y6EnF_eezhvr8os3wnpXqR53RjKrZ0QiOKQU-z22fwGdM3E4VdFh0u7KPrn2D_EjXy7Ij-ZXhYg2cKlMrvzSlXXuwICnFhcljbNuHPOnvX6OBpJqYlcWUJq3WDyowVxwONd-SgTwVdbW0hAS6y2gCQ/SD9GAnG1Xf4JY9DzH2lhtFvP-25BJcLhmSt8r8tx3MA",
    "avatarChanged": true,
    "basic": {
      "vieName": "ÂU NGỌC ÂN",
      "engName": "KK",
      "ydiId": "YDI0004",
      "haId": "",
      "sex": "女",
      "dateOfBirth": {
        "year": "1986",
        "month": "02",
        "day": "03"
      },
      "age": "40",
      "zodiac": "Aquarius ♒",
      "nationality": "Macau",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "澳門 +853",
        "number": "(094) 738-4944"
      },
      "emergencyPhone": {
        "countryCode": "澳門 +853",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Finance",
        "other": ""
      },
      "position": "Head of Dept",
      "titleJob": {
        "preset": "Finance",
        "other": ""
      },
      "directBoss": "Toni",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-005",
    "createdAt": 5,
    "departmentId": "dept-marketing",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "RARA LI",
      "engName": "RARA",
      "ydiId": "YDI0005",
      "haId": "",
      "sex": "女",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "Korean",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "韓國 +82",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "韓國 +82",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Marketing",
        "other": ""
      },
      "position": "Dept Manager",
      "titleJob": {
        "preset": "MKT-Korean",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "離職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-006",
    "createdAt": 6,
    "departmentId": "dept-hr",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/RnMkPmqLg-36_2nbfUgmjw/jVGg0FcWRzRbCIl5YHGOmIEXwMQ6kQGRnX-szdUdU93mG3cSG1M62u3kMtdxZRGc8wZwY90RfI3A5A75wgifTbAH1MtTA2_UUf48pSoOVPuUtl1mhX8gZAI37DKOuy7MEm0mQKbtYk-xcEUhL0zcVA/7ubTBIkI1G7RDZup2UoSEfBSmN22s2wWMz5g-UCsW7I",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN NGỌC ĐĂNG",
      "engName": "MICHAEL",
      "ydiId": "YDI0006",
      "haId": "",
      "sex": "男",
      "dateOfBirth": {
        "year": "2000",
        "month": "11",
        "day": "09"
      },
      "age": "25",
      "zodiac": "Scorpio ♏",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(091) 343-4780"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(091) 408-0396"
      },
      "emergencyRelationship": {
        "preset": "母亲",
        "other": ""
      },
      "email": "yidinghr999@gmail.com",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Hr",
        "other": ""
      },
      "position": "Supervisor",
      "titleJob": {
        "preset": "Hr Admin",
        "other": ""
      },
      "directBoss": "Toni",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "11",
        "day": "16"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "02",
        "day": "14"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "15"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "0913434780",
      "bankName": "MB BANK",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-007",
    "createdAt": 7,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "SĂM MỸ DUNG",
      "engName": "SAMMY",
      "ydiId": "YDI0007",
      "haId": "ITO 842",
      "sex": "女",
      "dateOfBirth": {
        "year": "1993",
        "month": "05",
        "day": "17"
      },
      "age": "32",
      "zodiac": "Taurus ♉",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(093) 438-3293"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(079) 407-9706"
      },
      "emergencyRelationship": {
        "preset": "兄弟",
        "other": ""
      },
      "email": "mydung170593@gmail.com",
      "nationId": "079193026379",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Supervisor",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "11",
        "day": "30"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "02",
        "day": "28"
      },
      "officialDate": {
        "year": "2026",
        "month": "01",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21015"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "024753331",
      "bankName": "VIB BANK",
      "probationSalary": "30000000",
      "officialSalary": "33000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-007",
          "name": "Sammy host.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/CMjrTO-7fGfXX2kyLPjYSg/upuP8QL_paNYVSwwuOvtRv4GZep00zaJ60ORFMdF4BJcqIPNCPwjkTxh5_CUTGPE9zV33zdFv0H0WfI-6f10v6C-ap7NnW0-lRsgmfPiM9REZjJ1WjTOuaa89Q44HbkcYvLnYuf_mDbsG0p5U68ulEOrRcVPhjtpEgzKyKqftq0/C5Ghbg2yn9YKrWm9eHczkN6oKSr6bK2WIMbWI4PlB2I"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-008",
    "createdAt": 8,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/N_LLfAC-z9w9XiurGtut4g/Ak_UobWalwMxCjIb5KvbGtpG7n6IQblxK54vadPyMWdy1xCp_DeFZ__1e_lq__qeFhSQ7qnj73lGg2hTbjoztKtmOn3rymFxzvDT6o7MOExMH-nSA3Mj7552ONLQqGo7_2koxUAsA1tOXkJkumE0jg/M1em7wncu3CSGZNHHwY3BqQk4DaBXMAAq7y0pNzA2ks",
    "avatarChanged": true,
    "basic": {
      "vieName": "DƯƠNG HUỲNH QUYÊN QUYÊN",
      "engName": "QUEENIE",
      "ydiId": "YDI0008",
      "haId": "ITO 562",
      "sex": "女",
      "dateOfBirth": {
        "year": "2000",
        "month": "06",
        "day": "13"
      },
      "age": "25",
      "zodiac": "Gemini ♊",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(090) 825-3311"
      },
      "emergencyRelationship": {
        "preset": "母亲",
        "other": ""
      },
      "email": "queenieduong136@gmail.com",
      "nationId": "096300005003",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Acting Supervisor",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "11",
        "day": "24"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "02",
        "day": "22"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "23"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21015"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "9233307",
      "bankName": "ACB",
      "probationSalary": "22000000",
      "officialSalary": "22000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-008",
          "name": "Queenie inf.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/RIPv13vQzKVoEAp4PuovTw/ai5knbyzEVpKxDHmgPk2zvqs3xvUKUwvLoBU1HndFozQNaZsM2vxI6sF-wHM7A9gg9yQlKSq19n3m1ijQazEnE-uEmkYJ4ExGp-oEWnRvJWHP3tRJQxCloU6O4XgRg6FVfs4jODCssaQY41k_6cStsJ2LfrQerkEiy4fszh1LIM/RzgS4i3UjWu9eLUQNiZJ0naz396XYlx4Oq0jdCtDr58"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-009",
    "createdAt": 9,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/UvIoknM_3Wewy1yw-vQWfg/y051obIvSKJTu35HNueJIWdfBXX9mwL3OwiMhOmJEG4dIwLal1Gtql5Alqjpt3bEDpYv6j_jQHLDTgtSgx_Ubw-C0q6l6jsA4jZrPxAEDeGdf3Gp76MhIsiV5t5tETssR_Euw5uI3m9-XpVRywCDrg/yERi_a0iuqXZcICv-s8zmVN9a__bR8sG14IU2KuWz0E",
    "avatarChanged": true,
    "basic": {
      "vieName": "张鹏",
      "engName": "PENG",
      "ydiId": "YDI0009",
      "haId": "ITO 021",
      "sex": "男",
      "dateOfBirth": {
        "year": "1997",
        "month": "01",
        "day": "04"
      },
      "age": "29",
      "zodiac": "Capricorn ♑",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "TRUNG QUỐC",
      "placeOfResidence": "HỘI AN, QUẢNG NAM"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Supervisor",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "11",
        "day": "30"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2027",
        "month": "02",
        "day": "28"
      },
      "officialDate": {
        "year": "2027",
        "month": "01",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "2200",
      "officialSalary": "2500"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-009",
          "name": "Peng inf.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/pJGcxk_QmUPCm6FRhCDhDQ/Rg5JWH8s62iFgj1gciEPf5wOzrpBa140_Zb3hUXgvj3bZwmZMENRsjIHTzXPnr-at_1nJ-JRs0P9-pS8DX4JyE7UE7cBBzbGGO7gRPQdJbLR8mHBkQ-ZFho3u-T7eIISZl_PjUnee4VKop_VbjZehyhOBhiK8tfQbE33j55Fz1U/pevb6Jvpp2yv4-dSXjzmumReJC_jowXDX1fJa0O6CI4"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-010",
    "createdAt": 10,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/Y1IDeYLK6pmYjmS99NZiUQ/-npwaAC-yg9FzSk1t-KNzmllYcwp76gWWo43AV1zlqzZBMFm4wZyv_vJ6LCl74qtXSRTmP6cGLzTEMNXIi6x5R87W-olS0MV84AKVPyXTlJ7JOtEa7XLi60SybsIqUDR_9NT9Svb6P1qEtfBgXNhIg/hfUR0Y5MWzctLoiNqyKENB1dNU58eiz_IhV1g4hZp0A",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGÔ HOÀNG CHƠN",
      "engName": "JOHNNY",
      "ydiId": "YDI0010",
      "haId": "ITO 1263",
      "sex": "男",
      "dateOfBirth": {
        "year": "1985",
        "month": "01",
        "day": "01"
      },
      "age": "41",
      "zodiac": "Capricorn ♑",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(090) 841-3185"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(081) 250-7869"
      },
      "emergencyRelationship": {
        "preset": "姐妹",
        "other": ""
      },
      "email": "chon.mtvn@gmail.com",
      "nationId": "093085009689",
      "placeOfOrigin": "Tân Bình, Phụng Hiệp, Hậu Giang",
      "placeOfResidence": "Ấp Thạnh Mỹ B, Bình Thành, Phụng Hiệp, Hậu Giang"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "離職",
      "onboardDate": {
        "year": "2025",
        "month": "11",
        "day": "24"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "02",
        "day": "22"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "23"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21012"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "1798591985",
      "bankName": "TECHCOMBANK",
      "probationSalary": "18000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-011",
    "createdAt": 11,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/rFTWGqTGfImXkaiDwrPPtQ/q82_5D2wYx_EbBGNtBhnNGiD2dnlIzp1acH7Os0VRN_Z5kxS_p3-0WANbDRM4_TEE4vJGqyIBGiLKpaIGD83kumDDGxnyvJ5Ve6C2z_i6l7jAC8xQYe-ZaajLNxOeDIuuiB-yQVMQfGEEsCUBJyRXg/dW4V2Q5GPKQVWnuSMiP08O-2pSDLpCrTJRnqF61Dtcg",
    "avatarChanged": true,
    "basic": {
      "vieName": "PHÙNG THỊ NGỌC HIỀN",
      "engName": "JOY",
      "ydiId": "YDI0011",
      "haId": "ITO 1264",
      "sex": "女",
      "dateOfBirth": {
        "year": "1997",
        "month": "10",
        "day": "13"
      },
      "age": "28",
      "zodiac": "Libra ♎",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(093) 510-2300"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(090) 508-1290"
      },
      "emergencyRelationship": {
        "preset": "姑姑",
        "other": ""
      },
      "email": "hienphungsl@gmail.com",
      "nationId": "048197002174",
      "placeOfOrigin": "Hòa Khương, Hòa Vang, Đà Nẵng",
      "placeOfResidence": "Tổ 38, Thanh Khê Đông, Thanh Khê, Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "11",
        "day": "24"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "02",
        "day": "22"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "23"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21016"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "5610976845",
      "bankName": "BIDV",
      "probationSalary": "18000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-011",
          "name": "JOY HOST.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/mBV6goBeyG2W9Tm-rD9X-g/jjbDuD2tb9rURUW5SB7aGZTQSvbLVgvYsqJPS47c4OZ34CWIuICYtZpV7fLAFuuE39xLUMvPC_FGxdZS5JLjoNzzzH0PJKkkK5tkyvSYd_IJ-KUGuP9spH4Gx6F9fjKZHL2CyFrRGpsCWG5vinWgazNAnrCrBxoub094i3NrcVM/oIa7-jT3Hv8oroocEtIj1OrctUPed04u23T3dwzMaS8"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-012",
    "createdAt": 12,
    "departmentId": "dept-cage",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "PHAN THI NGỌC HIỀN",
      "engName": "LUCY",
      "ydiId": "YDI0012",
      "haId": "T-ITO 069",
      "sex": "女",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "離職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-013",
    "createdAt": 13,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/YIqvqNrgCJ7sU7Woz-6Dtg/MxPFBZrjrvThiQuhKXzWk-5OHe7kxAtxqmm5ioXpVKaKIMGWKj7o4818Ozahegrt7fwdIDYOGEzSYubJwlJj6z-Y3crikBsYdoV962QRLE0hR4XIu2N1KAAOyksFC4Qee31XucCCoeR2IsBbdR_S7w/ydOXlf3-Oep2GJ9XYi3nfGrGOl-mAtLgj8uYMz1hC_o",
    "avatarChanged": true,
    "basic": {
      "vieName": "BÙI THU HƯƠNG",
      "engName": "HARLEY",
      "ydiId": "YDI0013",
      "haId": "ITO 562",
      "sex": "女",
      "dateOfBirth": {
        "year": "2000",
        "month": "08",
        "day": "22"
      },
      "age": "25",
      "zodiac": "Leo ♌",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(092) 436-0147"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(094) 998-6958"
      },
      "emergencyRelationship": {
        "preset": "朋友",
        "other": ""
      },
      "email": "Thuuhuongg199@gmail.com",
      "nationId": "066300013624",
      "placeOfOrigin": "Ea Knốp, Đắk Lắk",
      "placeOfResidence": "Thôn 2, Ea Knốp, Đắk Lắk"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "11",
        "day": "24"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "02",
        "day": "22"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "23"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21023"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "101883713600",
      "bankName": "VIETINBANK",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-013",
          "name": "HARLEY CAGE.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/32-9jNmc-wb4RZ1hyPBxOA/SzwGmhpxF-sdS1NS7XsnkgS-m3BvRHSAIAhehFWPreVa5hKkmBZXfao_2bEvF0lRazbT842I_XbhJ0-sEhbGtM28ZLqinM2nEgQJW_zE8h0yw3axb5sGIPKqWcgEEvtIfsBu4NWG-nGjQ4AsC_qaUxxcQgnld_cEqXr0dqzuZ-Y/9Pyoi-lj7w5_Qeq0y3bLlKY1144KOQCwyhHwJyh_9QI"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-014",
    "createdAt": 14,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/cb6efa_FnLNa7oYRS-7mVg/YrOYo6tL8pzW-nvkstwCwD97XZCiKtoUaam03_QuH1NOBCddHGVBPxVH_nDUwka846l2eS0-AoX_pQ3CjQz3osdJMglajP2-cTn2DDCXlWng8a-dApo0AbKkpPdCfNsW60MzB_WVEKjwvEQamFCn1g/_SA0oNAkDa1jsyCc_m4AKqfH2si_j--Jix5zEg6VC3E",
    "avatarChanged": true,
    "basic": {
      "vieName": "VÕ THỊ NHƯ PHƯỚC",
      "engName": "MIA",
      "ydiId": "YDI0014",
      "haId": "ITO 1267",
      "sex": "女",
      "dateOfBirth": {
        "year": "1994",
        "month": "04",
        "day": "03"
      },
      "age": "31",
      "zodiac": "Aries ♈",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(083) 635-1027"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(090) 544-7428"
      },
      "emergencyRelationship": {
        "preset": "夫妻",
        "other": ""
      },
      "email": "nhuphuoc4394@gmail.com",
      "nationId": "049194005241",
      "placeOfOrigin": "Đại Đồng, Đại Lộc, Quảng Nam",
      "placeOfResidence": "Phước Định, Đại Đồng, Đại Lộc, Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "11",
        "day": "24"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "02",
        "day": "22"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "23"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21031"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "1020992475",
      "bankName": "VIETCOMBANK",
      "probationSalary": "18000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-014",
          "name": "MIA HOST.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/7sMGpv936x8Vp7Rs556f8Q/LYMRi4eO5Nu5FXy3-CtNC7PHJ15ErgSMFU1I9UotlvLmUWNn2a6fIN_h2DKd4HubGYFbPTvpbhHo6NL8_uxweg-_bzqjKl1K5jJXTLdUyTMTENGqxhty3wCnGf0r6tt3hPLsbAbEfawAkk2JQTvrt-ZsGdmMcsmsdlby2R-XfNE/a3dbcRaqe6NmQ1LY-4UaxosuTleXtpczwryJlTnIVKc"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-015",
    "createdAt": 15,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/a4ClMX50UAbXKdX1_lRDgA/eVSohuc6DCXQaQZDuW1pFpgprKxEP01LzritWVJ6iTkl2r1dJTHso5yxn7_HUel-dCQ1VgFdbMxphlocjK1T3_lHl23MT51L8PMdJyy5RAs6lR9LJ452Z_2GYupOCEyRu3mW_YdFS0jmmTB0xwy8G4ifm336sKijVELM9gvtuqA/S3bxNNyktkB0rjs3H4VAadH1uwch7y2MsY8DaJm95Uc",
    "avatarChanged": true,
    "basic": {
      "vieName": "LƯƠNG Ý NHI",
      "engName": "SCARLLET",
      "ydiId": "YDI0015",
      "haId": "ITO 1268",
      "sex": "女",
      "dateOfBirth": {
        "year": "2003",
        "month": "10",
        "day": "30"
      },
      "age": "22",
      "zodiac": "Scorpio ♏",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(039) 505-9441"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(081) 234-5479"
      },
      "emergencyRelationship": {
        "preset": "朋友",
        "other": ""
      },
      "email": "luongynhi3010@gmail.com",
      "nationId": "062303004919",
      "placeOfOrigin": "Mỹ Tài, Phù Mỹ, Bình Định",
      "placeOfResidence": "Tổ 9, Duy Tân, Thành phố Kon Tum, Kon Tum"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "11",
        "day": "24"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "02",
        "day": "22"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "23"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21031"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "040099381614",
      "bankName": "SACOMBANK",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-015",
          "name": "SCARLETT CAGE.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/EmjO2cswgjJOjKTeBBOqLQ/pRgCX95vXq2IgFu3CzOW9WDBziC5AkFMUqvH7Dj8eE6egR-ehWajC9v--9NiIgFqXk1q6cIWgE0pgh5vpWjez4TMqLt6keC5Tf8eRjTSN_zIlmLpk4hI8sNBLtZUN8YqxTdvTtnihlbFc_RB5VWSOxMSPC3g4poPh0jcYE9jGp8/FLNTkrs65nbGV1OqKAmasSnPs-1cHpW2DldqyrW4pl4"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-016",
    "createdAt": 16,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/UaBIjj6LZbn6mmVKGGR8QQ/89p_LyMp8zK_Fap2dMT31OIGwoYY4kCRci2y_zozJsv-UcheLDfGFbgeNIz_Kl5rcK8nHKYuT5QLsCrC6zZsMHJAowQjyJkWiBdYlJy5tRT3-oE_-LKDZHYz2W3gIuXFqNMpva56NCCHwmvEvPjj_w/kV1tQ5ucBxTAs36q9LT4GpkOvyhtJtix2aRmHP8hH8o",
    "avatarChanged": true,
    "basic": {
      "vieName": "ĐOÀN THỊ TÍNH",
      "engName": "FLORA",
      "ydiId": "YDI0016",
      "haId": "ITO 1269",
      "sex": "女",
      "dateOfBirth": {
        "year": "2000",
        "month": "06",
        "day": "16"
      },
      "age": "25",
      "zodiac": "Gemini ♊",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(003) 926-2807"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(038) 461-0792"
      },
      "emergencyRelationship": {
        "preset": "朋友",
        "other": ""
      },
      "email": "ttinhtinh959@gmail.com",
      "nationId": "051300009474",
      "placeOfOrigin": "Nghĩa Kỳ, Tư Nghĩa, Quảng Ngãi",
      "placeOfResidence": "Thôn An Nội Bắc 2, Nghĩa Kỳ, Tư Nghĩa, Quảng Ngãi"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "11",
        "day": "24"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "02",
        "day": "22"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "23"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21023"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "0271001083707",
      "bankName": "VIETCOMBANK",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-016",
          "name": "FLORA CAGE.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/cyda9FitxSoFM5sYPlEcZg/41As0z5u4ubb15OpT2h6yFhh2LXAiX72iz7ebKHY_jgxlHRD52ep7ykYqse84SRQdJRFFqEDhOxKhiZBzAz12tuUmsh3v2nJI-skXK4w4smSaLMhdKc3M9NIzSZqYyINtkTc_gMU2Ycz3SQcj2Tq3NCVeKjg02vKPUFvxQVR_uM/WOIzF9FkhZ7MoMI3IuUl_w8g4MySA9tqjxTTd0zDltY"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-017",
    "createdAt": 17,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/8APvS3wz41ZU1Rn0JuYZJQ/_oAiSZfKfTZxXe2K_AzZV8UgXVpBGs1pDJBJr-RgM6YOtNGXvSmGYFTSlFG3Z9lZjprZg-5-DrTTNvOBrb2jounR8mbWdo-hl3I1ywX6ypVf5NwZ2-bLjtRrY_ozdjSbgDjfqjxPKcgO1461rnSseztXOPiSKn1QUdkmyiyilc0/HGer21uz5sqXrMdLsASve221vyRiqlsMvdrEdcFY-Rc",
    "avatarChanged": true,
    "basic": {
      "vieName": "LIÊU ÁI LINH",
      "engName": "LUNA",
      "ydiId": "YDI0017",
      "haId": "T-ITO 069",
      "sex": "女",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "離職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-018",
    "createdAt": 18,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/dytN8U7VtOPDjIITuIj2ow/xPK8QDwPNxDYwY02mZh12P53P4AJeQQ6MtLZPTurrxSxeKuc402mYo0lI1S0Pa3M8tF141RU6DSjjo1Yhk7cymLUU1lEr1ujquMKRAx9alskAvFYw2Nwo6i1zQ31FqM-7IcyGfkXuxCTYVY2eLnTOQ/wAT9hZxpm8EyKM0JvLkOlafBjycsdsHMw1XbkMnDuvU",
    "avatarChanged": true,
    "basic": {
      "vieName": "LÊ QUANG HUY",
      "engName": "HENRY",
      "ydiId": "YDI0018",
      "haId": "ITO 1271",
      "sex": "女",
      "dateOfBirth": {
        "year": "1998",
        "month": "06",
        "day": "08"
      },
      "age": "27",
      "zodiac": "Gemini ♊",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(036) 478-5036"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(096) 864-7628"
      },
      "emergencyRelationship": {
        "preset": "姐妹",
        "other": ""
      },
      "email": "lehuy080698@gmail.com",
      "nationId": "045098007553",
      "placeOfOrigin": "Triệu Thành, Triệu Phong, Quảng Trị",
      "placeOfResidence": "Thôn Cổ Thành, Triệu Thành, Triệu Phong, Quảng Trị"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "11",
        "day": "24"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "02",
        "day": "22"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "23"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21012"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "1016656439",
      "bankName": "VIETCOMBANK",
      "probationSalary": "18000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-018",
          "name": "HENRY HOST.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/RWF2-6Cuvwt5nlGu-djucQ/70OkSvWrUKfjx5iEkROMA__GBErhCt1FFqpR14yA5PLquKTIj28Ssz0Osf6-ENc8fegFlD1oxYiNGlyUUjmt8PnaJbALS4X8PXXfxj_MUaO9XiBsp6WYrVjg-cOFfAdSYq7o-unmzlRjg6vhDTv0jyIFsM_HTh5f9he8UFAaqtA/vbEF0lsafA-IKeMGOYN-KXKEhtQB6bOkdNlaVoRcZD8"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-019",
    "createdAt": 19,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/ao4xKT26kPEiajcc3ty5cQ/Hp8E4j0GodV3mBMHH0u9wD5oMr_0ONbXQ2eI8sp_8evj9Nt8L3jMBC8c3i3l-WcHtWOE22JqYLbxTjvii-ADhDgWYLXRpNvt5uJbshTf36Xnz1JJvs5A5d5iU0Y-LR_bBwBh7wTwHWHwVRQa6UzythvVThGkdw1QW5JROH3qHaQ/R7DU8jqhXyqgpssH1i8IbmYOT1bXIk30qX-kF6DMSgU",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN THỊ QUÝ HẬU",
      "engName": "HANNI",
      "ydiId": "YDI0019",
      "haId": "ITO 1257",
      "sex": "女",
      "dateOfBirth": {
        "year": "2003",
        "month": "07",
        "day": "27"
      },
      "age": "22",
      "zodiac": "Leo ♌",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(086) 901-6070"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(034) 418-7496"
      },
      "emergencyRelationship": {
        "preset": "朋友",
        "other": ""
      },
      "email": "quyhau270703@gmail.com",
      "nationId": "045303001269",
      "placeOfOrigin": "Hải Hưng, Hải Lăng, Quảng Trị",
      "placeOfResidence": "Thôn Lam Thủy, Hải Hưng, Hải Lăng, Quảng Trị"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "11",
        "day": "28"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "02",
        "day": "26"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "27"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21032"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "9869016070",
      "bankName": "VIETCOMBANK",
      "probationSalary": "18000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-019",
          "name": "HANNI HOST.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/JywD-RJ7KZbMUvkQaS3D-w/wKu76ccAI_uAB7-2m-x-0pqiYSi1cR95rwVOOQlBldXP20NrMMJHGy909_cAvfZmAJ19fxNoWQeltnFRdDRga8rxKJyRJ7elpdRbtHH3wLvgZua3CPPRPrNz2O-lrV54ZUsYOeBwQIGS21CXS5MrSMpWAFJDEAjSRFrBjhdd6ms/MYa-8HDmd0xbxSJP9DXvL8m0Adi-uFZ22m7lpD5D-ug"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-020",
    "createdAt": 20,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/zFVVf-08DZdHmMAXI8_6pw/B8bRv2j-hZ2fILiAXjBl_1VJyOJNmSiHs3rVnkG6MrI75Z1O_tb-CVBfI704rbA9-6XiE3UklS3OgWIPm31MXozGcezruxKMKKQnXTsDmqzRLBID1MWSWo1Azf73YtK38eANFlXshEtzrgdDGvlsEQ/OvKBNu3gWaRRUpqDSs7_-ePLwv83TrhyV1iz1eNX1c8",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN VĨNH KIM NGÂN",
      "engName": "SUZY",
      "ydiId": "YDI0020",
      "haId": "ITO 1259",
      "sex": "女",
      "dateOfBirth": {
        "year": "2003",
        "month": "02",
        "day": "24"
      },
      "age": "23",
      "zodiac": "Pisces ♓",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(082) 411-3210"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(076) 670-8231"
      },
      "emergencyRelationship": {
        "preset": "姐妹",
        "other": ""
      },
      "email": "thienngan2402@gmail.com",
      "nationId": "048303007803",
      "placeOfOrigin": "Bình Hiên, Hải Châu, Đà Nẵng",
      "placeOfResidence": "K21/2 Nguyễn Trường Tộ, Bình Hiên, Hải Châu, Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "11",
        "day": "28"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "02",
        "day": "26"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "27"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21036"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "1027919606",
      "bankName": "VIETCOMBANK",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-020",
          "name": "SUZY CAGE.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/oX3ycdGagV6AcvY8stVyZA/hJIg90i4vN0VMtlDPBgDRTkrhOfTkVlY6cM4kt_Zv2NjIIj95ykSmbT7dBOp-EzXJ3Q6Qau8hREnI7BbKRvGvseIIOLIoAJ2JTZb0grxRiy0l07yHNALF8DJfWz56Uy501H0tVsm4zQDnD7XXU5bKajPlj6NGbrTp5iRGoEzfb8/k7yggigt5h9mf98LOLej2UQEuTVwUDn0hNnJMCn5k4I"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-021",
    "createdAt": 21,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/wO0Py5Qe59RQlqn_t5B4Pw/cPWEMZRjcLt_n8TGitSao6tD364OZq4Ts1iVLpiQtDa2G0crtLONYcN86VNNWVj-ZqjzgyL4EotKqYzfMPVQ10FE7dG5M2qdTA7C9UkHsi_HFL4YUIDntxkgsO7g1bo6Ten1Ad5PA62IdVnR9thWDA/5O98tPw8VG8Lw5LNVhp5k6_fQpO9zkyxIx80KNGTLgE",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN NHƯ QUỲNH",
      "engName": "QUINN",
      "ydiId": "YDI0021",
      "haId": "ITO 1258",
      "sex": "女",
      "dateOfBirth": {
        "year": "2003",
        "month": "10",
        "day": "27"
      },
      "age": "22",
      "zodiac": "Scorpio ♏",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(086) 800-6319"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(081) 704-8516"
      },
      "emergencyRelationship": {
        "preset": "母亲",
        "other": ""
      },
      "email": "quynhnn21@uef.edu.vn",
      "nationId": "080303016210",
      "placeOfOrigin": "Bình Đức, Bến Lức, Long An",
      "placeOfResidence": "T2-05.23 KNOCT Tân Kiểng, 35/12 Bế Văn Cấm, Tân Kiểng, Q7, HCM"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "11",
        "day": "28"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "02",
        "day": "26"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "27"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21036"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "27101704140624",
      "bankName": "MB BANK",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-021",
          "name": "QUINN CAGE.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/2MTUsuJQmi097xtt5Vjw0w/IyRGqLkjbDfwadQSAmIJBpoonn7Gio9LWOZcGlB5x06J6WEcuXuDqvoVgsipA5jEBH2YFExzI3Mh70MXs43MAXh3k9waJLLbrK8P2WUBvwJ7CIkq8hJlNNbKjgNazrrmZ7BHs_J68uqK-pDpZOZyRy7vvrdVOBOP53WI0y8RtDg/IiPpmXCTmh1sE8K19N3Aw0WwpNtJtt5h7kqJZaIKkuQ"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-022",
    "createdAt": 22,
    "departmentId": "dept-cage",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "NGUYỄN THỊ LIỄU",
      "engName": "NARI",
      "ydiId": "YDI0022",
      "haId": "ITO 1231",
      "sex": "女",
      "dateOfBirth": {
        "year": "1998",
        "month": "04",
        "day": "02"
      },
      "age": "27",
      "zodiac": "Aries ♈",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(078) 909-9660"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(093) 562-8572"
      },
      "emergencyRelationship": {
        "preset": "朋友",
        "other": ""
      },
      "email": "Lieunguyen.020498@gmail.com",
      "nationId": "049198003573",
      "placeOfOrigin": "Điện Tiến, Thị xã Điền Bàn, Quảng Nam",
      "placeOfResidence": "Điện Tiến, Thị xã Điền Bàn, Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "離職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "01"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "01"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21223"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "1012417063",
      "bankName": "VIETCOMBANK",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-023",
    "createdAt": 23,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/v19ooUbu9pgwHSvtp4LnDA/3F4npgWNeiSyO08KUFJm1IpskWDWr-J4kykpmxyl4lOr7XyY69crTfWRka3aFA9RNZiGVKVFsUAAsFUq7x1DZCYb0Lj0IaVuuYKH3dnrRcCf3i-oVCmRppd3wB-Jm0DoigWLMFl5zLEGJZVBRmMFgA/VZXShGPuJH1PVHB3TfK-lCWVCgyT2egUSYVfeTEawww",
    "avatarChanged": true,
    "basic": {
      "vieName": "LÂM CHÍ HÙNG",
      "engName": "DAVID",
      "ydiId": "YDI0023",
      "haId": "ITO 1238",
      "sex": "女",
      "dateOfBirth": {
        "year": "1982",
        "month": "05",
        "day": "08"
      },
      "age": "43",
      "zodiac": "Taurus ♉",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(093) 868-5300"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(078) 500-8169"
      },
      "emergencyRelationship": {
        "preset": "父亲",
        "other": ""
      },
      "email": "lamchihung0938685300@gmail.com",
      "nationId": "079082007952",
      "placeOfOrigin": "Trung Quốc",
      "placeOfResidence": "161 Nhật Tảo, Phường 08, Quận 10, TP. Hồ Chí Minh"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Booking",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Hr-Hiring",
      "status": "離職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "01"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "01"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21231"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "0938685300",
      "bankName": "VIETINBANK",
      "probationSalary": "16000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [],
      "remark": "BLACK LIST"
    }
  },
  {
    "id": "employee-024",
    "createdAt": 24,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/Yr3d7rZDzO-T32Ziig6gCw/DwJVmFJYP1dnh5V10_lsqziyEqqWQ-_vtYNZJA4bd3mWFzZguhSOoe7lBP93hxf53G8QyQ1TMSWyoBtRX94bDFf97gEtj6TRAmGrgKBdTo8qZZNUZqBIz8hxGeWcb3h9ZP9D7IRd5Gn_hRHAryTXjg/aSZny1unSnHioZZ2EObxxkkiNeT1JiQ6ABMnojDP_Os",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN LÊ HOÀNG VŨ",
      "engName": "DANNI",
      "ydiId": "YDI0024",
      "haId": "T-ITO 069",
      "sex": "男",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Service",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "離職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-025",
    "createdAt": 25,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/QtC5hpzueOW2th3FpLsW6g/B-tR6E-GGSrZDHbUITpFNsxY9SS4nWXrEhYkkGvenCh9m8Jj-H5cZ9cm2ei_Z7VFmx73BU8aveRzuwe-xBICXdvUCXj4guaiX-8fh434CmnTEmJAScb6eVXQ0Q_OaC0zwHS8COF20Kt5K-icR0GHhA/OW6Vg_vIDJGI0LBUX-eL5uf3jqlZGqBUsl7-jTH2mz0",
    "avatarChanged": true,
    "basic": {
      "vieName": "TRẦN THỊ LIÊN",
      "engName": "ALICE",
      "ydiId": "YDI0025",
      "haId": "ITO 1255",
      "sex": "女",
      "dateOfBirth": {
        "year": "2000",
        "month": "08",
        "day": "18"
      },
      "age": "25",
      "zodiac": "Leo ♌",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(089) 812-7790"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(070) 559-0959"
      },
      "emergencyRelationship": {
        "preset": "夫妻",
        "other": ""
      },
      "email": "tranthilien0818@gmail.com",
      "nationId": "049300002883",
      "placeOfOrigin": "Thăng An, Đà Nẵng",
      "placeOfResidence": "Tổ 9, Thôn Bình Tịnh, Thăng An, Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Service",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "01"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "01"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21225"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "106869262667",
      "bankName": "VIETINBANK",
      "probationSalary": "16000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-025",
          "name": "ALICE SVC.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/joYpXV19BCZLDAerwask2g/wgE3M9YtEMW3pDxaPI5FxXzVE1VwgnlGkUQK0kGFioIdc22P6iVeylugy3gzR9qW0EbjpgWpeNGmt3YFNipWajmX6aWNv_BaB2nGROKRS1Cv0W2RohsTlJfI_yArmguXXG0slCEDewUcVyp1RtqP_uNfdOY5Meomh-Ldmgoxwvs/oLJUq6OKCnjl2aPIpIibneiGT1PSaKEuoyXqQcLe59g"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-026",
    "createdAt": 26,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/g-tlEFYF83eCogfmLxvk9A/knvEym1NSqOUmC1omM5Zu_O2Ms-bh6L3-ey_hOthPaCXumqNciF6gSsXBiP_ycVbNOMU7D5q8tznFI76Izm-MmSO-ibCYcx3cSD6ZfBANnZLadSIx2ypYhr6WSyHGpTFm4aJxkUbzhwLcfxtsBpY2A/ERpztP8srRD6h2kc_D1mD9SjsuCa4MQMaF6y1IPCF1o",
    "avatarChanged": true,
    "basic": {
      "vieName": "TRẦN NGUYỄN THANH DUNG",
      "engName": "LINA",
      "ydiId": "YDI0026",
      "haId": "ITO 1260",
      "sex": "女",
      "dateOfBirth": {
        "year": "2001",
        "month": "05",
        "day": "23"
      },
      "age": "24",
      "zodiac": "Gemini ♊",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(094) 598-9468"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(094) 398-9468"
      },
      "emergencyRelationship": {
        "preset": "母亲",
        "other": ""
      },
      "email": "zungoi.nghene22@gmail.com",
      "nationId": "045301003599",
      "placeOfOrigin": "Triệu Sơn, Triệu Phong, Quảng Trị",
      "placeOfResidence": "Tiểu khu 2, Thị trấn Ái Tử, Triệu Phong, Quảng Trị"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Service",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "01"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "01"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21005"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "3910797957979",
      "bankName": "AGRIBANK",
      "probationSalary": "16000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-026",
          "name": "LINA SVC.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/JWABe-mpMnqSHFzzLNFMYA/kja0Pk_Wb45EXIrF9mRqh2FOc4RlK_2GkAYmuyFJybckvvUCIFxRKLIa7hwrX5Sy0ZC6bdJ4VYe1Lfn42fZOUw3B4lDivNNAw0ko8n23KXZzhQ-jFV9RJ5z4BhWTR4qsg5_5-s4Cm_KLuWAUIR73ItfVWvqG6pM9UENjWlDPrJE/EcaCCloxNOsAKcOWROh6O1xAXpPohty2JAmjIuTnKJ8"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-027",
    "createdAt": 27,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/nYIV8JXS5h8uw1Kt1aqCpQ/WSSGPPa6aTaKhK3iHDAgH3X469XX7lREOg6zsBr82Gba1zIX65XhebFxG68BY1jXGTGfTAcuL9S3e3GxSuKLDSBtcGWp7081NT9xD10zhkxuXwbWXgkSK19D49AHnHXU7Z6riQ6QrGZbXBaz6BUuvw/KoGgMjwBJFAxkC0w6vQsddTnF6QcbtF3C1CCIHNatE0",
    "avatarChanged": true,
    "basic": {
      "vieName": "MAI THỊ THÊU",
      "engName": "JUDY",
      "ydiId": "YDI0028",
      "haId": "ITO 1261",
      "sex": "女",
      "dateOfBirth": {
        "year": "2003",
        "month": "04",
        "day": "26"
      },
      "age": "22",
      "zodiac": "Taurus ♉",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(032) 575-0172"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(098) 168-2201"
      },
      "emergencyRelationship": {
        "preset": "母亲",
        "other": ""
      },
      "email": "meixiu0426@gmail.com",
      "nationId": "036303005521",
      "placeOfOrigin": "Nghĩa An, Nam Trực, Nam Định",
      "placeOfResidence": "Xóm 3, Nghĩa An, Nam Trực, Nam Định"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Booking",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "01"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "01"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21013"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "5601755165",
      "bankName": "BIDV",
      "probationSalary": "16000000",
      "officialSalary": "22000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-027",
          "name": "JUDY SVC.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/y5RkobKCH6W0qvYdMoE5Tg/x6YJ2uYr1u7LQ6bGOgYpr-zr9auOt3l6srKkeMr7ak2epsfTbC3u_lgdiNZUV7-dluxAQ6zeIV8BJ4iZOpbAfnugBGu8v8_JlDmwE46_y4HuJDHfIsb5TEOEDqEXNR3XHheUujiqIKuwzzaUHsf8G1KxM7tuv6lq0Oq9Kb26fT8/OXzB-jhxt4mfa1jeN-YyFe_b3W2UmA2kDy33hOWNwCA"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-028",
    "createdAt": 28,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/G02hCsEE7zi19BwTN2hg2w/_FTf_opKnTCf16-4We6xonvqQBP8f7QE_ffmPZMYSQ79Ci7LLFG5DuAt9uK2ptw31UkE5qhWWAKObMUzealKNM67XY4oRWlJN4oPqCUbysZaboBukx7oPvgHWxSTAlolY116UD7wzeh1LUXI1lYkmA/5LkHMIJV-M1PSgw0b3msCDXXbkZDmgVwTiGbAEaRVp0",
    "avatarChanged": true,
    "basic": {
      "vieName": "HOÀNG NGỌC HẰNG",
      "engName": "JENNIE",
      "ydiId": "YDI0029",
      "haId": "ITO 1262",
      "sex": "女",
      "dateOfBirth": {
        "year": "1998",
        "month": "08",
        "day": "03"
      },
      "age": "27",
      "zodiac": "Leo ♌",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(090) 586-2786"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(093) 566-9395"
      },
      "emergencyRelationship": {
        "preset": "姐妹",
        "other": ""
      },
      "email": "ngoviettri2018@gmail.com",
      "nationId": "049198015190",
      "placeOfOrigin": "Quế Phú, Quế Sơn, Quảng Nam",
      "placeOfResidence": "332 Đống Đa, Thanh Bình, Hải Châu, Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Service",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "01"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "01"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21005"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "98991686",
      "bankName": "MB BANK",
      "probationSalary": "16000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-028",
          "name": "JENNY SVC.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/UC3OflkC9sNFqXtJAwADPA/qqj-rVMwRkPVIrBKMlCjz6KtL1aoiVF55qnxyiVEbyddtz3vMoku15tervt5iSPdfKVGPebSRCCcyVxUDNSPocBUAZnwUzVF1yowW3q5ZQmS5gZ4LkE0gm5MXA1d833YZDcQPntHJMWXrwrw7hcxgpw1rmu4sJ9rpCqa8fEURUE/zTivJJPBwnFDPe7IYDAx66v4UtmSMB_2lTE9mR2B1tQ"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-029",
    "createdAt": 29,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/NXufBpkSw15fERnmITntfQ/TpVfyELkzG5mR2H4LNjR_lu8DT5s9JD3B-d5h2j_7Q7yKKxOQRC5OfCGXCd0kNSyWOtM2yMqeiEEPUXvyBNaeRmMnxdVpzcfC-f6G7KT7je4eZd0rOfmUZ-HmzMAtey_0u6emmo9yeA93d7pWdA66Q/SqHXygM9a9ZWZBe9obzYveSq80NhkVCxjzXcpVBf7Oo",
    "avatarChanged": true,
    "basic": {
      "vieName": "THÁI THỊ THU HƯƠNG",
      "engName": "ROSE",
      "ydiId": "YDI0030",
      "haId": "ITO 1234",
      "sex": "女",
      "dateOfBirth": {
        "year": "2001",
        "month": "12",
        "day": "26"
      },
      "age": "24",
      "zodiac": "Capricorn ♑",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(036) 457-9322"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(090) 527-7387"
      },
      "emergencyRelationship": {
        "preset": "兄弟",
        "other": ""
      },
      "email": "thuhuon1201@gmail.com",
      "nationId": "049301007114",
      "placeOfOrigin": "Trung Phước, Quế Sơn, Quảng Nam",
      "placeOfResidence": "Tổ Dân Phố Trung Hạ, Trung Phước, Quế Sơn, Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Service",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "01"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "01"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21013"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "0389790513",
      "bankName": "MB BANK",
      "probationSalary": "16000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-029",
          "name": "Rose SVC.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/ojDXJqRycwfeTCo8pxG4tw/v98qMf3p9pbyUtYa9lGoMuyY-Ke_2gs1M5-Rozj4FDx4pvveM1_ky5wRTo2aHICnaoQPRqzqujQr9wkyNMEH_9G3vR4dhyEvT4HhP6qDHCy-34QtVMd7Dddryd6b-2Wpg6mp8IS41xmdsOHjF5zfbvubL9CLUOQRMq4ds041LA4/UoV15qzOwFFsa9RFoDtOtH5dUWK2k8NqtueWCdDEd-8"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-030",
    "createdAt": 30,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/3hd3G63pKQf7mXgQCLrvkA/X-EzKNcF6hovO2TaskAVfs3pHhd20iiXmDn1VNhq_4XaCB7JXERUR4VRpGWqVSxjqNTsLKNDcYqISAQ05rFyr96zDLdpXf7OzlLlaIewuCBfsE_QI9VNNCXXf4Ln8s9QklC_BlbowKaoh0oQic1X6Q/35xxg-0GbMXcZKTiC9LBH54uBww85TgNwoPKRdgMNvA",
    "avatarChanged": true,
    "basic": {
      "vieName": "HOÀNG HẢI SƠN",
      "engName": "KAI",
      "ydiId": "YDI0031",
      "haId": "",
      "sex": "男",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Booking",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "離職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-031",
    "createdAt": 31,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/XJFI75yzt4t3jq6q2yLaTA/61KLr2iuILZahaYDPwO0hDDCH9GN3nub3yhwMnENU9byvrGZpHhRDsr6zvCWxGeABlSMI1TBfxRwygddHg5ZinGiv16vZLN7jLCx-IbjaCV6Hp1RbMa5HMip6CaNGB8rfnu4w8CpFj1y9JIFbzKD6w/t9IryXJ2tOhgcP1kx4if4v8HQJCEznaq43eXyiL3t_0",
    "avatarChanged": true,
    "basic": {
      "vieName": "TRẦN THỊ HOÀNG",
      "engName": "DAISY",
      "ydiId": "YDI0032",
      "haId": "ITO 1129",
      "sex": "女",
      "dateOfBirth": {
        "year": "2000",
        "month": "08",
        "day": "28"
      },
      "age": "25",
      "zodiac": "Virgo ♍",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(035) 614-5395"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(098) 128-5597"
      },
      "emergencyRelationship": {
        "preset": "姐妹",
        "other": ""
      },
      "email": "hoangtran20000828@gmail.com",
      "nationId": "049300000395",
      "placeOfOrigin": "Lãnh Ngọc, Đà Nẵng",
      "placeOfResidence": "Thôn 2, Lãnh Ngọc, Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "離職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "03"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "03"
      },
      "officialDate": {
        "year": "2026",
        "month": "04",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21033"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "0356145395",
      "bankName": "VIETINBANK",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-032",
    "createdAt": 32,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/uHxm3cb5UIvOQlM6dELFHQ/s0nWWt5XlCNzFIXbDit-fWzlwqBnvs2hFKaqOBIVqVGLvCR-9fTjAUotNzQoKH1fBTteC4RIxzJTfPX1AeJZr3qarGPSHOjotAnDOZ_H28_GnEjoVb71A67Y6AAMITY7J9V_Ed24XVoPzJ_lXnBm8g/AkOY8z8vO4TcYenhmxenYzgkbG4kWNmEXJkbODR_YAo",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN THỊ HOÀNG THƯƠNG",
      "engName": "SAM",
      "ydiId": "YDI0033",
      "haId": "ITO 989",
      "sex": "女",
      "dateOfBirth": {
        "year": "1994",
        "month": "09",
        "day": "17"
      },
      "age": "31",
      "zodiac": "Virgo ♍",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(032) 813-8092"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(098) 866-8246"
      },
      "emergencyRelationship": {
        "preset": "朋友",
        "other": ""
      },
      "email": "nguyenthihoangthuong94@gmail.com",
      "nationId": "056194000938",
      "placeOfOrigin": "Nông Cống, Thanh Hóa",
      "placeOfResidence": "Nghĩa Bắc, Thị trấn Cam Đức, Cam Lâm, Khánh Hòa"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "08"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "08"
      },
      "officialDate": {
        "year": "2026",
        "month": "09",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21223"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "107870193819",
      "bankName": "VIETINBANK",
      "probationSalary": "18000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-032",
          "name": "SAM HOST.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/Uk-fxYm2Rc2ji0JavzReYw/raW4MqBCSw2pkkaqUomvmPwHVsX_FcB6E9QZAIqXpr6p-36-i90h0xtFT6AFwS1vmXLXB09IrxHQ9nggKOFIX-6grEkYfDZZ_pvxKOTrrKu79RFN2iAcSsrBnP-FJT0V1oRSvzrkIIHBXB1OFk-FrrDg2JKEepFrqObOU82AwBw/V15-FNgUNhUtyptVZmo3eoCoIwZYWMP3NEwKuGiydjs"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-033",
    "createdAt": 33,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/IUHYW33Qlra8k9vVFPFfbA/fTi3WUoJ0PpBs8_3VdsBWspAIi6PC8GI6hGTHnHLJjCi0EVqxTZoF23Ki81-09VHe3NJqBltoFUWbyWFf41M28BT3ZyzjDuy9uKm81vBqTt9hhOhgdQ2b-EfwadFbvzeTLdTMc6DKJXHIu9qtZRRhg/uNenLUHe7HbdIVTbB-AbW9FdEi-FsgxCTrZvSKnJV9s",
    "avatarChanged": true,
    "basic": {
      "vieName": "HỒ THỊ HỒNG NHẬT",
      "engName": "SUNNY",
      "ydiId": "YDI0034",
      "haId": "ITO 1232",
      "sex": "女",
      "dateOfBirth": {
        "year": "2000",
        "month": "07",
        "day": "29"
      },
      "age": "25",
      "zodiac": "Leo ♌",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(037) 592-8895"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(038) 604-7515"
      },
      "emergencyRelationship": {
        "preset": "姐妹",
        "other": ""
      },
      "email": "hothihongnhat29072000@gmail.com",
      "nationId": "049300002390",
      "placeOfOrigin": "Duy Phước, Duy Xuyên, Quảng Nam",
      "placeOfResidence": "Thôn Lang Châu Nam, Duy Phước, Duy Xuyên, Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "08"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "08"
      },
      "officialDate": {
        "year": "2026",
        "month": "09",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21033"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "5625615104",
      "bankName": "BIDV",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-033",
          "name": "Sunny Cage.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/7VEGm9nKYRf5BrgJNBHA1g/VV_vAY4cqKolkI6qDQlUoeIP7wwP1ZPyrSyDzTz4_RXOr-cdwVuoosyMErRKiqO_O3Kjvime-qyK1ooweUIfFmZc-AAqFJG_2SUBYYHOFl7aDy1mPkluDacVOA5Ub5szvaleUnexDEwVuVb8enPsXsp8zjaBAkxQ1z8T4aI2Ra4/Hxg-2wLvj2hfby8MW-DUNHU8wZl6IFCj5CNyCklXiRo"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-034",
    "createdAt": 34,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/YjRzchjNeBIQ77ohOLGhQA/WUGBsKeeR3o2RZOBzhLPbp-80FweM8v43JWpFJrMAXRowslB_B_9PcagmSoKmdcskhWU9fYGInRnwhFiCvdMgsgiKrUFh4elBdTITe_YlHSduBD77-gdT_ln_QdDzoQ0AIWtd7FzE5JK7k5jTYordA/GcLawS5-xuYKY4vVZgPnKTAoxzmkn29OiV5Sq2vr0JU",
    "avatarChanged": true,
    "basic": {
      "vieName": "LÊ VIỆT HÙNG",
      "engName": "LEWIN",
      "ydiId": "YDI0036",
      "haId": "ITO 1237",
      "sex": "男",
      "dateOfBirth": {
        "year": "2001",
        "month": "06",
        "day": "01"
      },
      "age": "24",
      "zodiac": "Gemini ♊",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(038) 316-7937"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(036) 900-0743"
      },
      "emergencyRelationship": {
        "preset": "母亲",
        "other": ""
      },
      "email": "leviethungwin@gmail.com",
      "nationId": "049201007935",
      "placeOfOrigin": "Thành phố Tam Kỳ, Quảng Nam",
      "placeOfResidence": "Khối phố 6, An Xuân, Thành phố Tam Kỳ, Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "08"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "08"
      },
      "officialDate": {
        "year": "2026",
        "month": "09",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "20912"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "5602045090",
      "bankName": "BIDV",
      "probationSalary": "18000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-034",
          "name": "LEWIN HOST.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/o3OfccqUbyD3f8GrihJMUQ/GaYcyUmW9QpE-hguH7olEbK8J2KqpIGhkMLzbTBP6_XaX93keXYsQcFVLhLSemSWz_QunG4ePbviLHcxUYDI0Wju_o_TTnx50wSi3AUTA-h7OFVI-uT-bGtNsUyOgd0TfvCsS2ci-zE1yTo6UTY7LPLTOrsRW5Yg0eBCXS56PjE/YeQ4Mp1ouiFKrNZOcUnwGRPTf9ugt97hE9ldvLytKe8"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-035",
    "createdAt": 35,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/Kc-aL-XU1Ce7CKAxGR6SvA/EuhAJTA92TpLGtze-PAp6NUln7_0Cb5IAt3Hx2V3CxPhxZpS-vF24gmJmjRMoh9BTL8_PCx4vX9Xk3RZep5apiFkYT5c6RkpAGCEtttsDXI_ExTaS0-YHxfrDt7pkOYTtld_2IPLBsyP92Ovr30pPw/zWxpObaWunUX140aMYD-PWM1ywWNMXSnz2gwlCoIRXk",
    "avatarChanged": true,
    "basic": {
      "vieName": "DƯƠNG THỊ MINH THƯ",
      "engName": "TYRA",
      "ydiId": "YDI0037",
      "haId": "ITO 1243",
      "sex": "女",
      "dateOfBirth": {
        "year": "2002",
        "month": "12",
        "day": "31"
      },
      "age": "23",
      "zodiac": "Capricorn ♑",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(079) 555-3112"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(090) 547-2550"
      },
      "emergencyRelationship": {
        "preset": "父亲",
        "other": ""
      },
      "email": "thdng231@gmail.com",
      "nationId": "048302006381",
      "placeOfOrigin": "Tư Nghĩa, Quảng Ngãi",
      "placeOfResidence": "471/10 Núi Thành, Hòa Cường Nam, Hải Châu, Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "08"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "08"
      },
      "officialDate": {
        "year": "2026",
        "month": "09",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21208"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "200212318888",
      "bankName": "TECHCOMBANK",
      "probationSalary": "18000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-035",
          "name": "TYRA HOST.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/0TK9jRTIKJ02YgbRH8tA0g/eN2a5qLBqkQkdT8S_33N0Efjz6CPN5KcEPfPevDebAMEjEX8mTnEjVpadFogylkc6bE-zCRg01ZDCXS_7vLtTG8v0hbimi4uUqpOqNPJ1G6d-naIhYnpFxf_57EOPYD03I2jess7PbUi0LWcuzVsJ-cxkYyOOtruQ3CwKNG33Zs/oYT42A24pUNbIpvHo7QsridUgkmeOAgJ54y74uxjSzo"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-036",
    "createdAt": 36,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/sOLUXLRYF61xLIVuBgJOjA/3hPLuFtMOoqQDpCNrZrDz6IuLxlki9gGgm2jwD6raiWL9-ViTiwsdvNSJtStU8dG48wBZ4fw6IfWvYntaZ68-SZGQaP9oumSI48YWW-OQcHKo86s6TJYyrHyN0d_XD7lENDx7cFGKW63egeqJ3dQyA/CZCM2wmPIJxzmSnTDmpWON5F0-cmC1wvuTaQcO6z_9E",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN THỊ HỒNG THÚY",
      "engName": "MEI",
      "ydiId": "YDI0038",
      "haId": "ITO 1245",
      "sex": "女",
      "dateOfBirth": {
        "year": "2002",
        "month": "10",
        "day": "08"
      },
      "age": "23",
      "zodiac": "Libra ♎",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(081) 377-2873"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(091) 425-4108"
      },
      "emergencyRelationship": {
        "preset": "父亲",
        "other": ""
      },
      "email": "thuy08102002@gmail.com",
      "nationId": "044302000247",
      "placeOfOrigin": "Duy Ninh, Quảng Ninh, Quảng Bình",
      "placeOfResidence": "Duy Ninh, Quảng Ninh, Quảng Bình"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "08"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "08"
      },
      "officialDate": {
        "year": "2026",
        "month": "09",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21313"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "0813772873",
      "bankName": "MB BANK",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-036",
          "name": "MEI CAGE.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/FX80L7klYazgi7rypwiclQ/3Gozdi_NdhmvcLQp5lWfmw2E8xMYi1PY1jCLFNcONCZvBJR_EjL4hC4lm3y9LOB7VR5nIrWyGjJ_de1u1FH4lk-gPc27hbJbNJAq6fXy8DuW3XmN48AKIezO-VxuxwbG9v1BmetmyY1-JWc4HWGYim1cmM14pIgzzMSuJrtaDm0/ea6ZUWNaJ7g3RheSEG91YkyUCs8upDVkflxBBlpZh9w"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-037",
    "createdAt": 37,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/ou_2D1ak64NLt5zURjbLxQ/PfhkrG2qItVCZyHJ8VER4aTyfOTcP5hjJUCuWWduVfTKSUy7RMG5SEjviuXF2QRu7rKnE92EFmNDrAVdk2hePukS-DgDP_AXEZOUZAJzNFGAJpUD3-o-oPsG5jLcYS8u-ZxJJXlVidhe7yRI9wZqDw/YOXqzZ2rkDEModSEXElUOX3ql13DFimTnVft4hRoFyY",
    "avatarChanged": true,
    "basic": {
      "vieName": "TỐNG NỮ THÙY LINH",
      "engName": "LIN",
      "ydiId": "YDI0039",
      "haId": "ITO 1272",
      "sex": "女",
      "dateOfBirth": {
        "year": "2001",
        "month": "05",
        "day": "02"
      },
      "age": "24",
      "zodiac": "Taurus ♉",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(033) 612-2446"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(091) 654-5459"
      },
      "emergencyRelationship": {
        "preset": "姐妹",
        "other": ""
      },
      "email": "linhtong578@gmail.com",
      "nationId": "045301003467",
      "placeOfOrigin": "Phước Vĩnh, Huế, Thừa Thiên Huế",
      "placeOfResidence": "Khối 3A, Khe Sanh, Hướng Hóa, Quảng Trị"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Booking",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "08"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "08"
      },
      "officialDate": {
        "year": "2026",
        "month": "09",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21032"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "108870467134",
      "bankName": "VIETINBANK",
      "probationSalary": "16000000",
      "officialSalary": "21000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-037",
          "name": "Lin svc.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/AWd1EAr-BtD5tv_I69X_uQ/ltIDFksa7Xp0YfpzmazudMF3-K7445E1Me2LDVHF_EQhxSilr_cMQZ7TSTcCyM0twRprIB5v6asRiaOHSUIB2uw3qw0QnvA_Q6hsohvyiHVRYES6DKZZNjWV3NUt6-7GDdlwVAiKbzidTCbxgnqSm4StlHUKB0xUpJR2fTGOV6c/9xSwtCpHJjyikrAXMQvguApK51E0N6MfRE4QgLRoFGM"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-038",
    "createdAt": 38,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/M9cGTtu5Wy90fqhey72Thw/ZnL8Y_ikO0La8fxoWWUA_bLwLTwaA8_jZzL_FZvVL7Wmsnw7VeaS-cdZL_2Mp0cgkY9r4o2BWgxLeeE1aal0rX5shBEgzAjNY3OzJLDQxD6w5PCrIg0bDSdRkrGHeA0GhJ7C3yiisird7PBa-y8aDw/8ocnUGPYk4l51OoSIbWV_tOoQgPWYfeXXMJAMA_x-7U",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN PHÙNG NHƯ QUỲNH",
      "engName": "BAO BAO",
      "ydiId": "YDI0040",
      "haId": "ITO 1244",
      "sex": "女",
      "dateOfBirth": {
        "year": "2000",
        "month": "01",
        "day": "01"
      },
      "age": "26",
      "zodiac": "Capricorn ♑",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(076) 848-9868"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(093) 326-3428"
      },
      "emergencyRelationship": {
        "preset": "兄弟",
        "other": ""
      },
      "email": "banhhbaoo999@gmail.com",
      "nationId": "049300010280",
      "placeOfOrigin": "Quế Long, Quế Sơn, Quảng Nam",
      "placeOfResidence": "Lãnh An, Quế Long, Quế Sơn, Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Service",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "08"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "08"
      },
      "officialDate": {
        "year": "2026",
        "month": "09",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21332"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "19033880435015",
      "bankName": "TECHCOMBANK",
      "probationSalary": "16000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-038",
          "name": "BaoBao host.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/j5goxRnSstdbJ8P-saEdoA/wQSdX444G5c_gq_SwMM2GMrWOa4sUVbb9xEG3Obij9nXsm8CaQC4Gi0i00GBwV6f5kSRgDhPXuCl4eIUUMHrzIIQWsi0oBPbQGqfnCX35fX4bviysrVtD2sAdsZXdF5iK2Fy0br-LyrspAF_bUowapeaVxbhBHowRRJQssmMMOg/SKlsDNnIuGG3Ze4F0Pu4VVqgQaJCPilVFIYtsinQhiY"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-039",
    "createdAt": 39,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/dRLrKNn85iyteQ0leCgEFQ/0Na4XswWhDxuROGZq-eqvvSMFivljcj6zZijQt6DBZDCxJP2OviFHbD53-hfeKYH90y6VCJ-v1eoUc6y_1p1XnOR24TO0ZGaDCLWU8DgrxC10cTzV7fv7WrlnNtOv1Yp91GnRKkBc1e-_b2vpCPPiA/q5BQP4hygik3LOYyYZSLS3aa5MVrjYsCKvOUO0hUcEQ",
    "avatarChanged": true,
    "basic": {
      "vieName": "TRẦN THỊ ÁNH",
      "engName": "DAISY",
      "ydiId": "YDI0041",
      "haId": "",
      "sex": "女",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Service",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "離職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-040",
    "createdAt": 40,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/A8E6HcQnbaqi9q7o-eo2Mw/Iqfzby-SrEiWPTQLa8ddVsR8-ICz9YX697Nj4tBKUwvmWLYfqEG2JK3IufDoWGXQWhLHtKzEfYpfM4NsS1V4riwamxkbxGnikWxngbQZMETLbIUlr70AikdejGGTSR7KxtUapppFAqraKENJWeqZ_g/3c8qAGZtv5UsTLzG2imsT2ONQqOVcoGzogNTH_ObosA",
    "avatarChanged": true,
    "basic": {
      "vieName": "ĐẶNG THỊ THU HƯƠNG",
      "engName": "AUMIE",
      "ydiId": "YDI0042",
      "haId": "ITO 1240",
      "sex": "女",
      "dateOfBirth": {
        "year": "2000",
        "month": "04",
        "day": "02"
      },
      "age": "25",
      "zodiac": "Aries ♈",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(077) 621-3875"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(037) 978-8055"
      },
      "emergencyRelationship": {
        "preset": "父亲",
        "other": ""
      },
      "email": "thuhuongdang24@gmail.com",
      "nationId": "049300010702",
      "placeOfOrigin": "Điện Ngọc, Điện Bàn, Quảng Nam",
      "placeOfResidence": "Viêm Đông, Điện Ngọc, Điện Bàn, Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "09"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "09"
      },
      "officialDate": {
        "year": "2026",
        "month": "10",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21313"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "5601975459",
      "bankName": "BIDV",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-040",
          "name": "AUMIE CAGE.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/xSN85rTOwKpXCELlHFaRUA/cKIT_f0sH2lDYZC3-OIfZ_qVaUJMajZvMLwDgeuM_rHw-Kz_f85HFqiKRe9i0xl4HCH6UGCdfiz98r85_ZT6DADbAmhFu3bIFdM5lArEIjyt1ptvJUx9Hcx0Jh8Rk5djvUrWBTnHf-zmiNpIAxB4VRnMCoauXJkSGjg9t6s1ids/26dBl1hLi3DvUB7eV2b96b4UZM2wp8jIEZWCdvGZGCU"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-041",
    "createdAt": 41,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/LN3Ho1Sj6uVvuPVIR9NgDw/tgyV_sLaT8dXDSIl_cCg0RHERJCbhDlF77mTnKQJUPf_wJNxKNMnFH387TzPH5r462NYaSp-QNekA3acWsCVrcrXOsc-KNpVhG596om-a-qi8_px89jHnskr0Z2Xmj-wnZzlLojd8A6S8V2M7GKX_w/Bm6lfbKglBuOKC8V-ir4NelF-oe89SbGySVNUCZ8z9E",
    "avatarChanged": true,
    "basic": {
      "vieName": "BÙI TRƯƠNG THANH THẢO",
      "engName": "LIMMI",
      "ydiId": "YDI0043",
      "haId": "ITO 1253",
      "sex": "女",
      "dateOfBirth": {
        "year": "2002",
        "month": "02",
        "day": "10"
      },
      "age": "24",
      "zodiac": "Aquarius ♒",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(096) 229-3159"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(036) 284-1409"
      },
      "emergencyRelationship": {
        "preset": "姐妹",
        "other": ""
      },
      "email": "thaothanh.bt102@gmail.com",
      "nationId": "064302003487",
      "placeOfOrigin": "Thị xã Hương Thủy, Thừa Thiên Huế",
      "placeOfResidence": "Chư Wâu, Chư A Thai, Phú Thiện, Gia Lai"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "10"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "10"
      },
      "officialDate": {
        "year": "2026",
        "month": "11",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21208"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "19073468304013",
      "bankName": "TECHCOMBANK",
      "probationSalary": "18000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-041",
          "name": "Limmi host.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/fHRO1bVPH4rrusAuGrqUGA/JllEgZ5tXNDxPQ3Hx1fluKdgTinZZzqWw_6ds-dpMmSusafXlk2UK6P4YQgL49g4S7E9Olxr0s1wbcTnS6zqhyTMQV51am3aLT1WRmeJx3CI6pBdR3KcKJIIrKgqLDsC03DiyBG5nyCcKs3ekMM4SZqi2D9MfhkRSN-T6m_LXk0/6fByncagtmF9VkfuxyPE5b62lI1fD_FOEqt_2fZwq-0"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-042",
    "createdAt": 42,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/4-nqUGVaWR0CrCn1xm-icA/lWu9rkYN1DBW5hhNOw7IQOu3OTMT6YiJQzk2Kh16sZzCQqq94BLqYoPoQjoMIlGr-GMKX213Q-MoXfDGLCh7t-fo1rZu3-p_mOr8PBDZCPblw7QjRv1DzM279fm1ft0q7BRpfwho7ftwH17A9jvVVg/r2beg9aeS9HRVze6Ikc12YsoolnkSBlI0y6fFMeF7R8",
    "avatarChanged": true,
    "basic": {
      "vieName": "LÊ THỊ ANH THI",
      "engName": "DION",
      "ydiId": "YDI0044",
      "haId": "ITO 1049",
      "sex": "女",
      "dateOfBirth": {
        "year": "2005",
        "month": "03",
        "day": "26"
      },
      "age": "21",
      "zodiac": "Aries ♈",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(033) 788-8326"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(039) 656-9240"
      },
      "emergencyRelationship": {
        "preset": "父亲",
        "other": ""
      },
      "email": "lethianhthi2603@gmail.com",
      "nationId": "049305005828",
      "placeOfOrigin": "Hiệp Thuận, Hiệp Đức, Quảng Nam",
      "placeOfResidence": "Thôn Tân Thuận, Hiệp Thuận, Hiệp Đức, Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "11"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "11"
      },
      "officialDate": {
        "year": "2026",
        "month": "12",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21236"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "0337888326",
      "bankName": "MB BANK",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-042",
          "name": "Dion Cage.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/tZ-hmZVAXM3kUEKb0LlrFQ/VK9tEyqvSuvPgskmmliI4RYH7sSfq-mYMzCscQx9Py-RqQN4hubkTJTeaKxGTmk7W7n52jucHopKuAwl3EFOnVjPdYtbBDR7r_Y6irgD3LzeDSXYZwVLwMwiutkVzWjHj4paQy_K0dZG69wUiX5jkzN2tU8QBcM3wZ1053D2-kM/aU3j--9G-faj6-QXOdtesitVG5OD5jESCZ2WZDOj4CE"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-043",
    "createdAt": 43,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/i8Sj0jA4WNj3aGR0pyv8Bg/c0shy6L8BRcqvECTNul-qNNDmjc-mdfi_i0Ilpm3jm0zyW7AJ_A2sQ_TrHYCacu1K-AJNoKnkE06YM98aF0u_qgw7lTuU_efxKIWiEzhLzmbLlRoDWsnNW5zn-o2GHiiuS6XozTkQytsqunMVZl50g/Ix9WEJHZoR2pr4h7mWkLzEuOTev9sXevzvsIcPDlXDU",
    "avatarChanged": true,
    "basic": {
      "vieName": "TRẦN THỊ TRÀ GIANG",
      "engName": "JULIE",
      "ydiId": "YDI0045",
      "haId": "ITO 996",
      "sex": "女",
      "dateOfBirth": {
        "year": "2000",
        "month": "07",
        "day": "13"
      },
      "age": "25",
      "zodiac": "Cancer ♋",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(037) 812-9307"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(033) 826-4055"
      },
      "emergencyRelationship": {
        "preset": "父亲",
        "other": ""
      },
      "email": "trantragiang2000@gmail.com",
      "nationId": "051300006733",
      "placeOfOrigin": "Thiện Tín, Quảng Ngãi",
      "placeOfResidence": "Xóm 3, Thôn Bàn Thới, Thiện Tín, Quảng Ngãi"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Service",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "11"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "11"
      },
      "officialDate": {
        "year": "2026",
        "month": "12",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21203"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "5601987995",
      "bankName": "BIDV",
      "probationSalary": "16000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-043",
          "name": "Julie SVC.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/RECLDfbu1NwIR3LFeKqZ_g/sjDSTS10pt5U4EL_8lKV8mIxPfb6CqXLbD_YCltHxlRRxFhph65yucdVYNS9aPx6Pu1P82_6ROtd-EwEUzMGAqZ-cnrX4nkJd6E_jN1VpstQQGl0r6RHlV-pwLEyKLMQ8GhYRuBJGfGBSVovW0wXlZfrtkpDJe8dlWMO1fCN_6s/IzKh1tOXmOBv2uJ_dxDsuInhKnk9YqI97z76quWFgFM"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-044",
    "createdAt": 44,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/9Lo1E9DkMoyZIo8exDCXgA/XQ8Q55nkRIeyakQCsKKsW80Ho4eQ_P1vrxhXc2YgCffCUCp8Dop9NhUmMUH-TOhHwiNxHXAQbKCeVh5S28OEPiJvxN2MOglInZ3T5DlaJMopEn-dVado_h5nRyOqkql8n9CPuHpfV0yRHqTAEtY8fw/Ssmd7gFEY3oomeZEQKxIso1Ncoi1axqGY28GqSAtYFU",
    "avatarChanged": true,
    "basic": {
      "vieName": "ĐOÀN NHẬT LINH",
      "engName": "KAYLIN",
      "ydiId": "YDI0046",
      "haId": "ITO 985",
      "sex": "女",
      "dateOfBirth": {
        "year": "2001",
        "month": "10",
        "day": "14"
      },
      "age": "24",
      "zodiac": "Libra ♎",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(076) 855-5368"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(090) 645-0041"
      },
      "emergencyRelationship": {
        "preset": "父亲",
        "other": ""
      },
      "email": "linhnhatdoan14102001@gmail.com",
      "nationId": "049301002700",
      "placeOfOrigin": "Duy Phú, Duy Xuyên, Quảng Nam",
      "placeOfResidence": "Tổ 64, An Khê, Thanh Khê, Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "11"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "11"
      },
      "officialDate": {
        "year": "2026",
        "month": "12",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21332"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "23080207",
      "bankName": "ACB",
      "probationSalary": "18000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-044",
          "name": "Kaylin Host.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/y4UNp8ZL3slIrdsAX3uNNw/-H5jZGQil_7UC8ro-3iNv178jWE6SiIlhDEkkV_LAntTGVSkS4m3ZMEUzj_Cs0XdLCt7FSt6SokR_eBRFcaDc5EDQvbeGRwEJv7sm6PUT7b7Z58-AmGMQzbjyW9V84KJbeSKjW9rI1viXTrtA_kFNKDg3RHTHMfOciL_MervU5w/67uw-iUNzuWQCGz-CzA7CFqkrAOilaprPUCde-tFvpc"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-045",
    "createdAt": 45,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/6rykeAcclFuxCnf4aREfqg/YMi7r7-uLVXhdekGGd3t_IkUM73aOp337xeBECvtMc-s1qcZ3v3QFW5W3-AZwGXH3bHtNYV136XHVGmPlaT_7bV10eJWRxEcL5bqcftlQMWwq_vq-U372fqHS1UHpUTYR5rN3DIranS4t38c9HZlyA/XQfqrtR2JIWTKaNzHdCaQpb2QyBO8Y5gmgqEnxRZttc",
    "avatarChanged": true,
    "basic": {
      "vieName": "TRƯƠNG CÔNG TÍN",
      "engName": "TONI",
      "ydiId": "YDI0047",
      "haId": "ITO 1248",
      "sex": "女",
      "dateOfBirth": {
        "year": "1996",
        "month": "06",
        "day": "11"
      },
      "age": "29",
      "zodiac": "Gemini ♊",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(079) 683-9206"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(039) 973-7327"
      },
      "emergencyRelationship": {
        "preset": "姐妹",
        "other": ""
      },
      "email": "tintruong116@gmail.com",
      "nationId": "048096007555",
      "placeOfOrigin": "Điện Thắng Trung, Thị xã Điện Bàn, Quảng Nam",
      "placeOfResidence": "Tổ 58, Thanh Bình, Hải Châu, Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "11"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "11"
      },
      "officialDate": {
        "year": "2026",
        "month": "12",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21213"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "5601276727",
      "bankName": "BIDV",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-045",
          "name": "TONI CAGE.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/exQaVL8a1I5RAcSGIweRtQ/NimafMwV7FmwMuOWwlIkmn5kKBuBnpTs8hOqJxHd_TYHt1YHqdYr7nMD28Yfkdsgm2jTnp14JFHKpXBn2GhwbxltMp2B3SU7QCfkv7OEZ89LGNuQkzyC3FQYGLrJnShUiCX0yBGlB_gLrFIvA4K4n9BGzD5AjSz8SdZHiwSAJ9c/sjpFb7CACdLoAzFNJvPeTQxmY9GZ86G4DtxebEzUQlM"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-046",
    "createdAt": 46,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/OPb2wO5XckyOkXk-r1usew/m39WxR7Dq_EYM4QYqs4jzouj8NXQPJiNJa-U8-lpyqOYQBd9t3bSp4jEzTFtEg58fuFdg_0wsFv3ilXFiQ7iG5tb98nRXXxUFzP6DVMs6AWiN4H10MuOyhccjSeVr5qLjyw9jnEp0hFMg80CPoLmfg/oeWZQfIW-UP2XwKUe2IAxpI-VMuOder88tsQEnQDYVE",
    "avatarChanged": true,
    "basic": {
      "vieName": "LÊ SƠN TRÀ",
      "engName": "WINDY",
      "ydiId": "YDI0048",
      "haId": "ITO 1251",
      "sex": "女",
      "dateOfBirth": {
        "year": "1995",
        "month": "12",
        "day": "21"
      },
      "age": "30",
      "zodiac": "Sagittarius ♐",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(089) 923-7769"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(090) 546-4355"
      },
      "emergencyRelationship": {
        "preset": "母亲",
        "other": ""
      },
      "email": "lesontra2112@gmail.com",
      "nationId": "048095001616",
      "placeOfOrigin": "Bạc Liêu",
      "placeOfResidence": "K80/2 Trần Phú, Tổ 12 Hải Châu 1, Hải Châu, Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "11"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "11"
      },
      "officialDate": {
        "year": "2026",
        "month": "12",
        "day": "03"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21213"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "04152917001",
      "bankName": "TP BANK",
      "probationSalary": "18000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-046",
          "name": "WINDY HOST.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/OINGo9gxOUhjFdlU6yFOxA/kuwYWXnGkGNknnJMCfRJY4dLG1fQP7UlCs8b9n1kaun00fTxGUerJzdLgxjAIte1WLfBBh6xFIN4Q_G65znv1vDeGDQJIBA-EqEyU0f_Aozq3wLDD5mi8aDnqZpBbI-dXeVw0tRsLDuJOLXkCfltmJL5yPj4ouIUCNPyOZtpxwc/yqKyN3wbMbNoWX3GSW_xKbhhVh8r_36vJTx28vknVwE"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-047",
    "createdAt": 47,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/6WqZZVkC_TivyP7Zy8e62Q/7u-ytu39e9LfZ5weyun_uc4_12SX8ayRuoLyQPsYdU-G_Y9qtF-W6J4Oj-cvSkpruy2SUG0rYF8sPDVKLWAo73kVBD9QgF4_6C0ZxZChVsL91IdPGUUIPU6F8gBT9vL7CmsOkiGa_Dk6uKsMM-UuXg/dYsMYWUwAqpfCOXr8mNkiNKSslL8XMada93P8QlVeKE",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN THỊ NGỌC ÁNH",
      "engName": "ALANA",
      "ydiId": "YDI0049",
      "haId": "ITO 1273",
      "sex": "女",
      "dateOfBirth": {
        "year": "1999",
        "month": "03",
        "day": "03"
      },
      "age": "27",
      "zodiac": "Pisces ♓",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(038) 653-7540"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(034) 768-5374"
      },
      "emergencyRelationship": {
        "preset": "姐妹",
        "other": ""
      },
      "email": "ngocanhdn7540@gmail.com",
      "nationId": "046199003818",
      "placeOfOrigin": "Phong An, Phong Điền, Thừa Thiên Huế",
      "placeOfResidence": "Thôn Bồ Điền, Phong An, Phong Điền, Thừa Thiên Huế"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "12"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "12"
      },
      "officialDate": {
        "year": "2026",
        "month": "03",
        "day": "13"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21016"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "5511099414",
      "bankName": "BIDV",
      "probationSalary": "18000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-047",
          "name": "Alana Host.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/-p985V_cBLKFDhRrsH0qWA/TlbYA19Rfef0uA8BTol2UVyFpf57W7nB3xmCOHk0qW1DohWPFtP1R1nVSRsa2DWT7v9Uq4YK-bqdAdUg9zfquzVDoyVrGErooqeZzEp5ukn53JRmtQgTRLtVlqFTFILkEU7zXqG_nwLeialPxDzl-m7SscLkBk3fTpxbyKojkBA/YBnce3I23W5MlIYmkOZws4_j2WQTBpchb6SRJIgvrSg"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-048",
    "createdAt": 48,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/dkmWt5kH0DMniilXAKECIg/Tuf2j-KcoK5PQOEizeng13WWKW3Yq4aXVwu8h0LHc7JjN_lD9XBmRfWIZRaS9Ro9G-XW3QEsxz7sYM04SmzQKnt83z9IdHCZ2IQ8jj3jvwrjpDZIbLo3q3XLDRgb9wshEfgeAl42tPCycK_L9SWuDA/Xc-rswtg12fLMOTA8fpsPxrPTwAostUWYp2HOtr5hW0",
    "avatarChanged": true,
    "basic": {
      "vieName": "HỒ THỊ PHƯƠNG THẢO",
      "engName": "SOPHIA",
      "ydiId": "YDI0050",
      "haId": "ITO 1274",
      "sex": "女",
      "dateOfBirth": {
        "year": "2003",
        "month": "09",
        "day": "09"
      },
      "age": "22",
      "zodiac": "Virgo ♍",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(077) 855-0768"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(094) 892-7629"
      },
      "emergencyRelationship": {
        "preset": "母亲",
        "other": ""
      },
      "email": "hotphuongthao8@gmail.com",
      "nationId": "066303002284",
      "placeOfOrigin": "Nghèn, Can Lộc, Hà Tĩnh",
      "placeOfResidence": "Ea Nam, Ea H'Leo, Đắk Lắk"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "離職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "12"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "12"
      },
      "officialDate": {
        "year": "2026",
        "month": "03",
        "day": "13"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21225"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "1054813326",
      "bankName": "VIETCOMBANK",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-049",
    "createdAt": 49,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/4B6pW8Vf0VD6Q8id9Ap7MA/OVCkOhAApTXlJnqqpvbTaEIrXnGWLZpgBpABfvjM1whA2ZaWS0sb6gwt58SUZxYDc3RsR7FUOpb1SBwJVA3eCEqoX5_Eqbk2w8my1OPQN1G1mlVtCEBDYx4N4bULZeabU3YXMiwr2OrTlgnFp5Nm7w/FzyvsNU1Mf6VP1BYU_OYrfBKYkD-4G1HU1T_B0e5Bqk",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN ĐOÀN THẢO NGUYÊN",
      "engName": "MAE",
      "ydiId": "YDI0051",
      "haId": "ITO 1256",
      "sex": "女",
      "dateOfBirth": {
        "year": "2002",
        "month": "02",
        "day": "01"
      },
      "age": "24",
      "zodiac": "Aquarius ♒",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(086) 502-1202"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(091) 343-8389"
      },
      "emergencyRelationship": {
        "preset": "父亲",
        "other": ""
      },
      "email": "nguyendoannguyen2k2@gmail.com",
      "nationId": "048302001291",
      "placeOfOrigin": "Thanh Khê, Đà Nẵng",
      "placeOfResidence": "Tổ 05, Hòa Khê, Thanh Khê, Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "12"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "12"
      },
      "officialDate": {
        "year": "2026",
        "month": "03",
        "day": "13"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21336"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "1017477819",
      "bankName": "VIETCOMBANK",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-049",
          "name": "Mae Cage.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/m6JhHfFyEaa0R4cbvrjlEQ/8KfOKMkLa586_j455BmzNLoybnS78t_nBu4BaJ_8SQ6hE16U_DyQL_fU8Uqoj11ALta4iFhS-CBREVJu4Uchx9Klt1l1CrDZtMC5gOsh2G5mtc55R9IsuEmhDHHQhNSIzEMHpZWxsOIwi_N6hbVTmMbZxPlO1q3G2PUCoqAEAwU/Dk13XJQnMce9_3OMennKyoC6X8qkkCJTQm8SJ8DW2yE"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-050",
    "createdAt": 50,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "TRẦN THỊ KIM OANH (保险）",
      "engName": "OANH",
      "ydiId": "YDI0052",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "1978",
        "month": "01",
        "day": "15"
      },
      "age": "48",
      "zodiac": "Capricorn ♑",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(097) 841-9141"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "397792988"
      },
      "emergencyRelationship": {
        "preset": "女儿",
        "other": ""
      },
      "email": "kimoanh011977@gmail.com",
      "nationId": "079178023248",
      "placeOfOrigin": "Thái Bình",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "離職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-051",
    "createdAt": 51,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/eM-jVH5hAzEqBxZ1REaqtQ/F5YlnlhURCiTFJKy_g6_WAasxTr-__Nc2FGGOPOlv5IpUKZF3hUKXL3uQ9R_zs-fCsAICkL2dcZkb5xglrAO_KSB-AaAZm_K2j_Apwa6yV3XqrRWeqPeYECFzbJtS_ejujWQwKAWLyVKXnBf-iPj2g/YpiZQAoO9awlmIXfIwPMTy89G9ASsL2J-DySR8ohke8",
    "avatarChanged": true,
    "basic": {
      "vieName": "VÕ DUY KHÁNH",
      "engName": "KHANH",
      "ydiId": "YDI0053",
      "haId": "ITO 1254",
      "sex": "男",
      "dateOfBirth": {
        "year": "1990",
        "month": "08",
        "day": "16"
      },
      "age": "35",
      "zodiac": "Leo ♌",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(093) 553-1538"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "774797352"
      },
      "emergencyRelationship": {
        "preset": "夫妻",
        "other": ""
      },
      "email": "Voduykhanh131117@gmail.com",
      "nationId": "048090000655",
      "placeOfOrigin": "Hòa Quý, Ngũ Hành Sơn, Đà Nẵng",
      "placeOfResidence": "Tổ 17, Bá Tùng, Hòa Quý, Ngũ Hành Sơn, Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Driver",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21231"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "1016758094",
      "bankName": "VIETCOMBANK",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-051",
          "name": "Khanh Driver.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/GZE6fUw30LHblo5WOi8LSg/48CNoyi7xVZRGTc8T-FjBwhqi3TL-pWR620bPuSVO5dgpv4m5IzSYeAaEy_sWsnPiPCzq6gkhlCtC1c0IYRp2eBecLiLB11dVFYcwEc0Ehjs8zZ1NQpQ7xZzn70ATYfeOo_cd4LoBNBYv9_CwubUE9SRfrliwfhWyqpkR2GDvc0/H8ocQcZfywil_gc6VvHoUU4T5kxjgL-rcepRAp0e4zc"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-052",
    "createdAt": 52,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/V3dGWvyXSDt4fJzu-MmC_A/aGgkRtu-DgZBk0SkJs5JiVylQlNGF0-sstIBDB-IdNOJpC4n9WdF1wsvKGMUmPZYEJqBo37bLY0Fia0Hx3Xoeq7EBi-Fmf2iydV9ihRWMocN7ZlPcq6IcyWP_i4HGaIX53sTrf5f8lJa67LODU5J_g/tCJbMZuNI264T-7sKt8-FOrUj590Hl3IfVzHPKgQ0iQ",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN THỊ BÍCH MAI",
      "engName": "LEILA",
      "ydiId": "YDI0054",
      "haId": "ITO 1275",
      "sex": "女",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Booking",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "離職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-053",
    "createdAt": 53,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/NYYhtW3HWqXYzALnXibHhQ/GHMeHL-aeDGmOYN5W-B8Ht0v_uvF3_1gwLPX4tq2UoT_vJQQxoozgO9DpNC_VCRn6Jtqq0aEi3HXAJXu1ofhwn-_0Kr9CsUc2u9sKjZxagm0gFDS7MFTNGRo_gs1aO-_rXTxBYh_Y6nwHddyBbJbqA/plnmI7qaJniIrqVWP0nrqYKiD9lzM8rcx7xR8MxObzk",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGÔ THỊ HỒNG NHÂN",
      "engName": "ALICE",
      "ydiId": "YDI0055",
      "haId": "ITO 1233",
      "sex": "女",
      "dateOfBirth": {
        "year": "2002",
        "month": "04",
        "day": "12"
      },
      "age": "23",
      "zodiac": "Aries ♈",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(037) 322-4087"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(036) 541-4367"
      },
      "emergencyRelationship": {
        "preset": "朋友",
        "other": ""
      },
      "email": "hongnhan3002@gmail.com",
      "nationId": "044302004930",
      "placeOfOrigin": "Hồng Thủy, Lệ Thủy, Quảng Bình",
      "placeOfResidence": "Thạch Thượng 1, Hồng Thủy, Lệ Thủy, Quảng Bình"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2025",
        "month": "12",
        "day": "20"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "03",
        "day": "20"
      },
      "officialDate": {
        "year": "2026",
        "month": "03",
        "day": "21"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21336"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "00005538113",
      "bankName": "TP BANK",
      "probationSalary": "19000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-053",
          "name": "Alice host.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/E67Qrj-Nhe-W9cMZHGg9Vw/VDzU-F1LjbS_Xvi8f5MoGieGwfTNfZmuUfsVhbzktwONpYVAwEkYSPGRpkZRbK4Dv3cRwKveT95su3EMGN--K5T2I4Lp7vgMS0v6noZaduRSb0-XMnaxfJDC7wU8auWkLmkGBDBADWOfdkAHV3U5WuVDA_5Dopxyx8SlP6-EWhI/HiZmbGISdSRIGvXkGHVgfy6KSJh0FPNxoPVZvzkjWyc"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-054",
    "createdAt": 54,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/F6jXUUhAPdpqJ5jub4qyPw/kgiBkrWHjhRSd13KDaq_y0DtKpxoJDGsRdlrP8U9Av5z1ws-vQgPf9Lb8rcagmJmMrj2T6g0Snk9pCZ-3wHaEHz-UhtMHaY4M58vNBRKbB9kc-r_7S1I9Z5LZAa-0Ca0i99l0va17425rtcb1_NHrw/YBKeErFqwOQcq2XbTZaVu5qkWod1byMndOl28tOfh1w",
    "avatarChanged": true,
    "basic": {
      "vieName": "TRANG DỊ TRIẾT",
      "engName": "WILSON",
      "ydiId": "YDI0056",
      "haId": "ITO 951",
      "sex": "男",
      "dateOfBirth": {
        "year": "1989",
        "month": "02",
        "day": "11"
      },
      "age": "37",
      "zodiac": "Aquarius ♒",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(089) 820-5889"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(090) 376-8218"
      },
      "emergencyRelationship": {
        "preset": "母亲",
        "other": ""
      },
      "email": "Phuccaihamcachan@yahoo.com",
      "nationId": "079089010236",
      "placeOfOrigin": "Trung Quốc",
      "placeOfResidence": "236 Phạm Hữu Chí, Phường 12, Quận 5, Hồ Chí Minh"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "01",
        "day": "05"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "04",
        "day": "05"
      },
      "officialDate": {
        "year": "2026",
        "month": "06",
        "day": "04"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21216"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "20000000",
      "officialSalary": "22000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-054",
          "name": "WILSON 0501.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/bIdbExrkI--uHWqbHGkF0g/HkG7oPqe8M2dYxJIE8gf82ueQ30GDpNsZeux3O-5LoRDvm50Pgvb0mfn3ZIh89AnPDYpVfNd-e-ap437InB6zMBy7JPuTiBhH1KiDVESlE7_Sd-hOM2wRuvhF5QRrXBk5tPOabnv0Rwkfp6ifbpCT_PfblN9yFLebRbwJcFudJw/qHnk6L7k50FUrZWIcB4Dkik6MIlZtkPTcj7YdAM7Gj4"
        }
      ],
      "remark": "三月份，代主管"
    }
  },
  {
    "id": "employee-055",
    "createdAt": 55,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/lRv3512QOTVxpJQxDl5-6g/XoBFuKPQBMHWmOMOZP53KiTsNHKTbSLZpHJOBh_EplOv3Nexz38SdUwxekaI8wwJDryHz-P1kATBc7jgiBWJf0ww3TjNTKUkRCwBbZCfZ-BUyedTI_iB7BW3q39ToXN1VVRmz2jg7U30lIxRMlja4Q/wutzjFzOwYVK1uaDizF4i2xPbtjiPJKYQFKsG903gBE",
    "avatarChanged": true,
    "basic": {
      "vieName": "TRẦN CÔNG HIỀN",
      "engName": "HIỀN",
      "ydiId": "YDI0057",
      "haId": "ITO 1296",
      "sex": "男",
      "dateOfBirth": {
        "year": "1986",
        "month": "10",
        "day": "10"
      },
      "age": "39",
      "zodiac": "Libra ♎",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(090) 557-4992"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "tranhiendlqn@gmail.com",
      "nationId": "049086014231",
      "placeOfOrigin": "Điện Quang, Thị xã Điện Bàn, Quảng Nam",
      "placeOfResidence": "Điện Quang, Thị xã Điện Bàn, Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Driver",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "20912"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "104880364413",
      "bankName": "Vietin Bank",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-055",
          "name": "Hien driver.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/pTo3RTNeXgym29EXr4BxWg/Z7Uyj9_gK1a7PoXUJ7T5-ClTovtfftFnRRfZI_22AhkMOAMJSQPKfJc6WEsfRJazw3E4Hwj4mS8vISxnFnDNZVWwj6shqScV6LDv6CZ5XA56j3P288uCuBD9yiYpKEjY6EDG_f5XHhjVt4IqklRDJBz2Q7-Jo7oUQJpdM4ZHCuA/AnfPUMamMI3y3H4aNwUc73keJUJLRmkSi00bIC_3TNg"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-056",
    "createdAt": 56,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/Vr-UOp4-Ld3QUE_ZPIT_4Q/t6c3N5W3UShe9LoIqRWLNtasikhp13kLjxqph3GsyRPkqVqjbTTM428P4LMdTuFV68VZlFPtRRgrDBnUJqvoVOC0cZM_JKvyXPtcPA45MNAqDACfICjl3zWFKHs-LpnL_yxWdEhCTY6nt9BxKuFtGw/1meGptUzHCAlar77oHhvpFlruWSkoEF9FShBr3b_5lE",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN TRUNG",
      "engName": "TRUMP",
      "ydiId": "YDI0058",
      "haId": "ITO 1181",
      "sex": "男",
      "dateOfBirth": {
        "year": "2000",
        "month": "04",
        "day": "21"
      },
      "age": "25",
      "zodiac": "Taurus ♉",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(093) 508-6695"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "tn241120@gmail.com",
      "nationId": "049200006902",
      "placeOfOrigin": "Điện Nam Đông, Điện Bàn, Quảng Nam",
      "placeOfResidence": "Khối Phố Cổ An Tây, Điện Nam Đông, Điện Bàn,Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "02",
        "day": "09"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "05",
        "day": "10"
      },
      "officialDate": {
        "year": "2026",
        "month": "11",
        "day": "05"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21216"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "1207199868",
      "bankName": "SHB",
      "probationSalary": "18000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-056",
          "name": "Trump Host.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/i4_3W1RtLExMo-9RZE2ugQ/46r5hsiKeLmpS42tGiWxxxQA8xKNqPxFV0qCsu4DQlQlwHByauPx_onfRWoohBLura2534-ElYPcKB5eXbABFMcC6vsAOwQgKc1DZ5N5ai3MyRWRqXBHDxtQy3d3EsROK7cRdUpr-X4doFP-WP7woPrxAAmr9Y57WOrtQu9QMxs/8eX8c_M8aFgAifibuEXJEAofDvkHGdrwErx-5nBE06g"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-057",
    "createdAt": 57,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/RgnVAXljOZ7upqfZ0x6C2Q/QUn6KobwnNW1rIOonAS5HE0NBwpmMlPTxhfbIzguCxmsZeZsM9h_PooUyPYma52UvS5ja18hxili8IgHmRVatsXDbu1TawDBhRds1--SO8mlSvRwYvi0jl8BJjs7ZtYL7ynb09VzlZ69YcYP6IeZyg/3IH7X1ORw7Z0g25yjb_6QHbThLnKuSUvRpRpIk9reFU",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN THỊ HIỀN",
      "engName": "HANNI",
      "ydiId": "YDI0059",
      "haId": "ITO 1321",
      "sex": "女",
      "dateOfBirth": {
        "year": "1998",
        "month": "07",
        "day": "12"
      },
      "age": "27",
      "zodiac": "Cancer ♋",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(090) 534-0496"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "nguyenthihien120798@gmail.com",
      "nationId": "E03938993",
      "placeOfOrigin": "Bình Quế, Thăng Bình, Quảng Nam",
      "placeOfResidence": "Thôn Bình Xá, Bình Quế, Thăng Bình, Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Booking",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Hr-Hiring",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "02",
        "day": "10"
      },
      "probationDays": "90",
      "probEndDate": {
        "year": "2026",
        "month": "05",
        "day": "11"
      },
      "officialDate": {
        "year": "2026",
        "month": "12",
        "day": "05"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21236"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "16000000",
      "officialSalary": "20000000"
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-057",
          "name": "HANNI HOST.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/tJl-ZaPOKYMEPdCGwVK7ig/1j6ZYv3FXu7yEhg8Z7LOfCG7Xt31p-HGoB4Tyo5QU_SmIMzCSVWtFwVxwLy3SVIass_Dzq88-gWOl7zAh8NDrSEk2BaO9_xWcru-r_tVs5wUO7-t-NkrXEbhP20gCfb_NXhMzUdRchwKFWicuAQJnymMr7FZFyK81nGzcj5riMk/PrM_1P_1uJ1RIavFYPckaT3RWrSUuTbchKX8LPsg2YE"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-058",
    "createdAt": 58,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/rlO6FuaBD0MUfXx49kjtpQ/gzRN-FZkFcqI_gBP78mPCh0uklbJ8LR6Seyh_8wrT2UeeVKMvZ6nlnmyttk7aRTKFkdbXQ6WBUBJPKDBaDYmI_QwRul3lnajpPBlQ0mGXMZfhjUv7XCkuWL4OpBfFeRT_jfR_8bRlYhxBpQcky9M5w/kml8ZSGeugnyPPTeIqHX6zi5yz2pDMzXtM7mbViQeLE",
    "avatarChanged": true,
    "basic": {
      "vieName": "ĐÀO HỮU BÌNH",
      "engName": "BINH",
      "ydiId": "YDI0060",
      "haId": "ITO 1316",
      "sex": "男",
      "dateOfBirth": {
        "year": "1986",
        "month": "10",
        "day": "13"
      },
      "age": "39",
      "zodiac": "Libra ♎",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(096) 720-4810"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "Daohuubinh1@gmai.com",
      "nationId": "068075003376",
      "placeOfOrigin": "Phú Mỹ, Phú Vang, Thừa Thiên Huế",
      "placeOfResidence": "Lô 18, KQH Lam Sơn- Ngô Quyền, P6, TP Đà Lạt, Lâm Đồng."
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Driver",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21233"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-058",
          "name": "Binh Driver.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/g3pfnQ5VOyrWBrNIKzQn8w/tGlqI3cI2bfaG-5r_ezh_2n4sDr_1wP1GEcUfpx6mvSE9XeSkV6ppRDqEtQg-ipCF5ls5E2aZlZSzM2mJZeXWdS89cStf_U69XWKzzAxtmfUNOPi_-Q_QsLGecoRSEcU3da7phr0kCQF1HBqP-Nt0OvKM70ubeAkwMk6oVDqZyo/WHtwbYlmYn6jRIm3QefiZIjNDcCcMlD0aOYUwYATcz4"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-059",
    "createdAt": 59,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/yE5O1GqBq-CJTBOwgD4Tqw/I5gZvSoYhUsJ8cuMRaGCnUsREnwcMdAwVC7D8PTkE-KZWTDZb9FGTP2BbGy7uoIl_H7AS7Rer-y8I0qvRTPimoV80hIqBTC_7cFeBpWDcE_qx9m6Z_FqogWraMVdwC8PqpK2zehKwBQ98WPbDFRFkw/Bu-AvxYMAWM-ObN_KV7y_7XSBy6hFaj9sBbjrCUmCP8",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN ĐỨC PHƯƠNG",
      "engName": "PHUONG",
      "ydiId": "YDI0061",
      "haId": "ITO 1317",
      "sex": "男",
      "dateOfBirth": {
        "year": "1982",
        "month": "11",
        "day": "15"
      },
      "age": "43",
      "zodiac": "Scorpio ♏",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(085) 386-8979"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "Ducphuong151182@gmail.com",
      "nationId": "068082000297",
      "placeOfOrigin": "Lập Thạch Vĩnh Phúc",
      "placeOfResidence": "9/6 Cô Giang Phường 9, Thành phố Đà Lạt, Lâm Đồng"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Driver",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21233"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-059",
          "name": "Phuong Driver.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/0ydmAzpqvLQGPWfeShuOPQ/CvmfYuppIn9V8NTRsmZOQsKqSHaEB1LMsQKFEO6Ap0KW1gUKzYsqu66ViU4zyKijvfulBNXdN7Dr0jfCGada3VF1b8pHYq0sPb-fkZcC4jYM3p00oyqJFOPXwYvgUYyciUwW9i2YqvI6LBE5QGu93BxKzisoK8NDJEhZXyOVs6I/wRbRKll4Pjjb17zWItYB2DkHvo89w6p8AGi8NJJbQWc"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-060",
    "createdAt": 60,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/yn0tZan3J-wmoyJSAmztqA/_3RIM3OOi_Bi-UlwHYp9o20uNsOxNRiWQKLeG8Sr2ettjsZigV1fDwnXO3tHt-9J5CSeJDdxTJObzsANrSZm6U-aBjs_O41TmPmNgn6gkrJx-ObAAOSo7jUXZNqBg0YuG1azJeO1UUWpsK6jxmX5-g/GJtEymLiPGjuionfHJ092inEEz0uBG-MO8lsUixowhs",
    "avatarChanged": true,
    "basic": {
      "vieName": "孙雨",
      "engName": "RAIN",
      "ydiId": "YDI0062",
      "haId": "",
      "sex": "女",
      "dateOfBirth": {
        "year": "1992",
        "month": "06",
        "day": "08"
      },
      "age": "33",
      "zodiac": "Gemini ♊",
      "nationality": "China",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "中國 +86",
        "number": "(032) 583-4451"
      },
      "emergencyPhone": {
        "countryCode": "中國 +86",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "srain920608@outlook.com",
      "nationId": "DB2320065",
      "placeOfOrigin": "Trung Quốc",
      "placeOfResidence": "HỘI AN, QUẢNG NAM"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Supervisor",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "02",
        "day": "11"
      },
      "probationDays": "60",
      "probEndDate": {
        "year": "2026",
        "month": "04",
        "day": "12"
      },
      "officialDate": {
        "year": "2026",
        "month": "04",
        "day": "13"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "3500",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-060",
          "name": "护照.pdf (https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/NzxKbnSlEsdLYmckyFiEwA/86Du0QDxnpetChQESbesj0BqNQ86l5x14QzB11Z6hIf98t3qHRL6aOobCQxfLL3M5ziv69JQSA8Jsysr0-4VrjbW3Lk8Ofg86G5KzQyEi6h6eEfG7oNUthD9MuKzaFdvqNFV1LaNm6bOBBUmwOwkKw/Mmvg5Wgb2TNck5XynYyBdOTXAOfOPjCnpc0IHUDhsd4),姓名孙雨.pdf (https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/vpwDDIJ-pAY6jaHi-cUCjg/vNTLoI8WpNilumVqXDa7yo8V2igHio_AYa-iXUqoKikYH5XiVXW97X5iiBoafqvLh9vlw8dv59Vk5K7kOpI2_071ZrlFdH3hKd10LLQtQts2whCdEOtaPoHQxQTP3RWJRZrTUQHMWHNSzq3H9JlHwQ/_K2nsKTkLtJ0kYKkEriH8wOiCncEPWx-Qlho8lmlNAA),CONG HOA XA HOI CHU NGHIA VIET NAM.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/RJ1uOQZL-9EKydueEj4ulQ/OBC_coMQHfOhr-x0DeSgfQbP8zrozm_jWglHfCnDZFovFHeRZ-ny56514B3736FgMCBuQPzml458g6EJvu2lqMJQpvxGQg52feb5OB12NVc7vjhcrLnGV2TP7_qOvylmgHrYGM48457Ex72P2Rzx9E6oaK3pZoOYXKHPZ8Yrt4CURIDrWLmLmcCVdxMklarn/-45fN_RYLRgiRNOiVGwFd-_3B4vZXrYTuIeA-cep_Ac"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-061",
    "createdAt": 61,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/8HKnc87hUVxam0CO6ZaW-Q/tNhhK-8G3OB-tv7eByAIvGnEopxL_W3aPSHC-3IFH-PtwLenl8k3rAp9mCsc-DBSqIXG23K7xFo64CX3tUdGozAcVEix6YU1CZHUHyGfpbd_hgS7EkkBLlejunzTQ3Vz-oIweCuA6W_ndBbSfPTUQQ/gOse4QRfhL2yJkl5XL57ApBfb4_wsmZW-tGJ5fP7y2Y",
    "avatarChanged": true,
    "basic": {
      "vieName": "TRẦN NGUYỄN DUY PHƯƠNG",
      "engName": "PHOEBE",
      "ydiId": "YDI0063",
      "haId": "",
      "sex": "女",
      "dateOfBirth": {
        "year": "1993",
        "month": "05",
        "day": "19"
      },
      "age": "32",
      "zodiac": "Taurus ♉",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(096) 862-0722"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(038) 816-0693"
      },
      "emergencyRelationship": {
        "preset": "Bạn",
        "other": ""
      },
      "email": "phuong157.dg@gmail.com",
      "nationId": "031193001858",
      "placeOfOrigin": "THÔN 3 THỦY TRIỀU, THỦY NGUYÊN, HẢI PHÒNG",
      "placeOfResidence": "HẢI PHÒNG"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Supervisor",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Internal",
      "status": "離職",
      "onboardDate": {
        "year": "2026",
        "month": "02",
        "day": "11"
      },
      "probationDays": "60",
      "probEndDate": {
        "year": "2026",
        "month": "04",
        "day": "12"
      },
      "officialDate": {
        "year": "2026",
        "month": "04",
        "day": "13"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "1905199386868",
      "bankName": "MB bank",
      "probationSalary": "2200",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-062",
    "createdAt": 62,
    "departmentId": "dept-cage",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "HƯƠNG VỊNH ÂN",
      "engName": "YAN",
      "ydiId": "YDI0064",
      "haId": "ITO 1347",
      "sex": "女",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "HongKong",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Dept Manager",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "離職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-063",
    "createdAt": 63,
    "departmentId": "dept-cage",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "LÝ TRÙNG KHÁNH",
      "engName": "HARRY",
      "ydiId": "YDI0065",
      "haId": "ITO 1348",
      "sex": "男",
      "dateOfBirth": {
        "year": "1976",
        "month": "05",
        "day": "30"
      },
      "age": "49",
      "zodiac": "Gemini ♊",
      "nationality": "Macao",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "澳門 +853",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "澳門 +853",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Dept Manager",
      "titleJob": {
        "preset": "Head of Cage",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "02",
        "day": "22"
      },
      "probationDays": "60",
      "probEndDate": {
        "year": "2026",
        "month": "04",
        "day": "23"
      },
      "officialDate": {
        "year": "2026",
        "month": "04",
        "day": "24"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "4000",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-064",
    "createdAt": 64,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "向南",
      "engName": "JONNY",
      "ydiId": "YDI0066",
      "haId": "",
      "sex": "男",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "China",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "中國 +86",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "中國 +86",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Dept Manager",
      "titleJob": {
        "preset": "SVC Man",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-065",
    "createdAt": 65,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/-Zsx7XnRfu3EllRAn8SoxQ/Z4taXyZZEgQvyLo8mQ196zsFcDf7yHmdChOfBnMqRU8aOjGhz9CfBUzG8Y6lY7MskMsfF502Mgq0nM_4ugy_LdqjhLSw2TLQhXm39JDj0CE4Kjw0UTMDPma87NJcQjdMXFPNop2-xqIQ_CoKvOpwQg/6pTJtddoQqLa0msDdn6lxeASwr9-gkzV5KTcYyu69Zo",
    "avatarChanged": true,
    "basic": {
      "vieName": "LÊ THỊ KIM CHI",
      "engName": "CAROL",
      "ydiId": "YDI0067",
      "haId": "",
      "sex": "女",
      "dateOfBirth": {
        "year": "1991",
        "month": "01",
        "day": "19"
      },
      "age": "35",
      "zodiac": "Capricorn ♑",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(076) 272-8231"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(093) 783-7292"
      },
      "emergencyRelationship": {
        "preset": "HUSBAND",
        "other": ""
      },
      "email": "kimchi916@gmail.com",
      "nationId": "049191015031",
      "placeOfOrigin": "Thôn Phú Phước, Xã Vu Gia, TP Đà Nẵng",
      "placeOfResidence": "Thôn Phú Phước, Xã Vu Gia, TP Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Booking",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Internal",
      "status": "離職",
      "onboardDate": {
        "year": "2026",
        "month": "03",
        "day": "02"
      },
      "probationDays": "60",
      "probEndDate": {
        "year": "2026",
        "month": "05",
        "day": "01"
      },
      "officialDate": {
        "year": "2026",
        "month": "02",
        "day": "05"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "4762728231",
      "bankName": "Techcombank",
      "probationSalary": "16000000",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-066",
    "createdAt": 66,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/E5ZRDdjjiVr1uoZnITr5ng/SR64p8GK40ACe-ijMWLzoW9tMZBjGoLPLNzLrE2b4bDkXAFxJ9-bDnF3o3yOEJTEHbv77lg8ucjQOHp5DaWNko4LKoIngsUUhmutUSbWEoQi8noz8z13fJ5dYyeQhgp7QQGWMH41a3qtnrrZh30AIO4xYnSW61Z1XPGzIQEOVCp5P7ASRDDUN4OVMtrxcYBu/3kU672e82c77QmmElv4NwgPBSPTkD2JuiJn58K8SbVg",
    "avatarChanged": true,
    "basic": {
      "vieName": "TRẦN THỊ PHƯỚC BẢO",
      "engName": "PHOEBE",
      "ydiId": "YDI0068",
      "haId": "ITO 1066",
      "sex": "女",
      "dateOfBirth": {
        "year": "1995",
        "month": "08",
        "day": "28"
      },
      "age": "30",
      "zodiac": "Virgo ♍",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(090) 443-5581"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(096) 286-0815"
      },
      "emergencyRelationship": {
        "preset": "SISTER",
        "other": ""
      },
      "email": "Phuocbao211095@gmail.com",
      "nationId": "049195009506",
      "placeOfOrigin": "DAI QUANG- DAI LOC-QUANG NAM",
      "placeOfResidence": "BAN MAI- XA BA-DONG GIANG-QUANG NAM"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Booking",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "02",
        "day": "05"
      },
      "probationDays": "60",
      "probEndDate": {
        "year": "2026",
        "month": "04",
        "day": "06"
      },
      "officialDate": {
        "year": "2026",
        "month": "07",
        "day": "04"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21236"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "050133146560",
      "bankName": "Saccombank",
      "probationSalary": "16000000",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-066",
          "name": "Phoebe Svc.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/EQJTYQgI2yMCuM8gnv73_Q/dslCZCoBkf8GF0vZpkY_adRKyif90kwINAM_EKjgd9c67q7kCIubrODsaV7-di8NEKwewPFcgbDsTBriAdfrnEarBMuJCEdPRUODIWbL7oKCcIQG7bLj6eP9ZMSL2ujZz75HbTu6u_UHczmL8r_to02Qbj6b6rynhjc3pIOjiws/kj7s-BoKrBOrf-V7gdWGprMeg8h2U7bcm7_cKCcAeM8"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-067",
    "createdAt": 67,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/gouuyHH1OW0_mCVvzsPnTw/AJkhxrpfwuhSxVTgoufNvkWiPvtAeMrRHwvvPPubIKM9T6lar_S7EN2rdAc2BW_Zlb5ygTzGtovfUFjrExNjVcsvjc0qE6uLyxLXGPUSXm7VISxbB0LqMOpMID6FqxiJzjqe7M4OHMdq3W2hyDrWyg/DG_uQVj3e-7oxaUVIVuucK-W6kGFmXyWNX2vZTMrkno",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN THỊ NGỌC ANH",
      "engName": "TINA",
      "ydiId": "YDI0069",
      "haId": "ITO 1383",
      "sex": "女",
      "dateOfBirth": {
        "year": "2003",
        "month": "11",
        "day": "25"
      },
      "age": "22",
      "zodiac": "Sagittarius ♐",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(077) 749-3082"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(082) 705-7357"
      },
      "emergencyRelationship": {
        "preset": "SISTER",
        "other": ""
      },
      "email": "ngocanhhhh25@gmail.com",
      "nationId": "045303001556",
      "placeOfOrigin": "TRIEU THANH-TRIEU PHONG -QUANG TRI",
      "placeOfResidence": "tổ 4, khu phố 1, phường 3, TXQT, Quảng Trị"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Booking",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "03",
        "day": "09"
      },
      "probationDays": "60",
      "probEndDate": {
        "year": "2026",
        "month": "05",
        "day": "08"
      },
      "officialDate": {
        "year": "2026",
        "month": "09",
        "day": "05"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21225"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "1024119644",
      "bankName": "Vietcombank",
      "probationSalary": "16000000",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-068",
    "createdAt": 68,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/9ySzWpZZUUWei27MXTB43g/gws_zb6lwjz9h_CJnMWFwjmCnaBn7ReK1Fea5WjFWwgIwRRsKp4KPSqNf4kEWp6dBOpGwVAFmSEkI1XvuSijLzQMjzvLL-eGona5-eQvVMwbRAyQx8pgZq5O3vuZ51KcA01a22NJpCLxdrLrF6dJUg/k3wWuztVXCo-mBnDChct4P7qyQPIE0sbQ8F4ms7IDvs",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN THÁI NHẬT ANH",
      "engName": "LUNA",
      "ydiId": "YDI0070",
      "haId": "ITO 1368",
      "sex": "女",
      "dateOfBirth": {
        "year": "2002",
        "month": "07",
        "day": "17"
      },
      "age": "23",
      "zodiac": "Cancer ♋",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(083) 334-4583"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(091) 370-8468"
      },
      "emergencyRelationship": {
        "preset": "MOM",
        "other": ""
      },
      "email": "nguyenthainhatanh1707@gmail.com",
      "nationId": "045302000123",
      "placeOfOrigin": "Triệu Trung, Triệu Phong, Quảng Trị",
      "placeOfResidence": "Khu phố 4 TT. Cam Lộ, Cam Lộ, Quảng Trị"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Booking",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "03",
        "day": "10"
      },
      "probationDays": "60",
      "probEndDate": {
        "year": "2026",
        "month": "05",
        "day": "09"
      },
      "officialDate": {
        "year": "2026",
        "month": "10",
        "day": "05"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21311"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "1047580704",
      "bankName": "Vietcombank",
      "probationSalary": "16000000",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-068",
          "name": "LUNA SVC.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/vNNfszHHOAqFUpiYmnJ8Lw/5v8e5mR1TM1jhJQCI0Axtq0nPDZIv1mKQzo5Iart7_ZK-_RP_0ydty8Bu3ZoSocpIVVMtNpcJISQrrKnvhAgI--z5yQG8u_e4RPzqhxS-pH8f7z4vJ5LoMfaS7YQ7Q8GfFFKZItyOd9eQ2l-T9e6WgTiMGMAXiJREVD234xYBzI/8N2Rh1lWLV7EhumvuQHhUqbI1Bk-92gCLvJwSJMdB7I"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-069",
    "createdAt": 69,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/wxHGZGAW_0K5k4D_Uuxg1g/qTgtaM8rrUnXDzgeKBKYV3hAE2MpF6qzYBlNXooELvqc7kUC5BBModIQ2x_M7sHZOSaOJ8jvzysTJd_orn_k-cE8vmg9-JKo1JYMeXxGm1-78gV8NOHGx9ftRZ7xF_HkxCoYrF8h2EwfP43-SJ8Npw/IUo8aHpQur4ah0dHF9vw-JFsOnhxQNucyRQluN3dkkI",
    "avatarChanged": true,
    "basic": {
      "vieName": "LÊ THỊ HỒNG HẠNH",
      "engName": "TINY",
      "ydiId": "YDI0071",
      "haId": "ITO 1367",
      "sex": "女",
      "dateOfBirth": {
        "year": "2003",
        "month": "07",
        "day": "05"
      },
      "age": "22",
      "zodiac": "Cancer ♋",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(036) 249-6743"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(079) 363-8939"
      },
      "emergencyRelationship": {
        "preset": "MOM",
        "other": ""
      },
      "email": "hanhle.9464@gmail.com",
      "nationId": "049303009652",
      "placeOfOrigin": "Điện Nam Đông, Điện Bản, Quảng Nam",
      "placeOfResidence": "Khối phố 7B Điện Nam Đông, Điện Bản, Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Booking",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "03",
        "day": "10"
      },
      "probationDays": "60",
      "probEndDate": {
        "year": "2026",
        "month": "05",
        "day": "09"
      },
      "officialDate": {
        "year": "2026",
        "month": "10",
        "day": "05"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21311"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "0362496743",
      "bankName": "MB Bank",
      "probationSalary": "16000000",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-069",
          "name": "Tiny Svc.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/OTvZHzbny2biLhl6xljJ1w/TAemiRWNRg5ys09wQimRvtUVN1WWko8l_1XjF6GRlGNy0L-DC36c0WkyNnGQnIWZzH1GoptcI-Feh9kdsHo46bAFbt9WJh6wE2NfwJio_xk9xYqD_c-AVY2KWIz8YYYmxNLid5w-OsX8jakd1OfpWhKf8JBfxQnF8sSQ19v3zrs/QUiNnws8h4VSPKY-cEw1oi0NK5UO7LAAU1TKv5IywBA"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-070",
    "createdAt": 70,
    "departmentId": "dept-hr",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/JAMDzkKgVeb359whXTR8cA/b3_n8Fe19vybSnWeNL4GR--T_u39SDONsCjzBSsGF3maMFdOedqIsIsiB_iUyziZF8lHLn8ZCy1D38O5PAAYJqF-Ck-EZnRrhbhV6Q9Ggu9QDR10ERYjLznPr9Qak8hR26u2ty6BzsnUwwbK_9QV6B1qUuq4nw6wiNeFeIO8eMeQvsIzjrBlc0sXEdTe8qlk/NFKRZCN-JXTwVDodnOBDzKBjfB8OUOrkhVXD4SlqSOI",
    "avatarChanged": true,
    "basic": {
      "vieName": "HỨA PHƯƠNG THẢO",
      "engName": "Hannah",
      "ydiId": "YDI0072",
      "haId": "ITO 1365",
      "sex": "女",
      "dateOfBirth": {
        "year": "2002",
        "month": "10",
        "day": "12"
      },
      "age": "23",
      "zodiac": "Libra ♎",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(082) 593-3598"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(090）589-5993"
      },
      "emergencyRelationship": {
        "preset": "MOM",
        "other": ""
      },
      "email": "huaphuongthao1210@gmail.com",
      "nationId": "049302009604",
      "placeOfOrigin": "Hà Nha, Đại Lộc, TP Đà Nẵng",
      "placeOfResidence": "Hà Nha, Đại Lộc, TP Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Hr",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Admin",
        "other": ""
      },
      "directBoss": "Mike",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "03",
        "day": "13"
      },
      "probationDays": "60",
      "probEndDate": {
        "year": "2026",
        "month": "05",
        "day": "12"
      },
      "officialDate": {
        "year": "2026",
        "month": "05",
        "day": "13"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "10305"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "6061928386",
      "bankName": "Techcombank",
      "probationSalary": "18000000",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-070",
          "name": "Hannah Admin.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/XK004LQ9m5LFpvCoHj-NYQ/ZLZSlzTxonou8lilmAySA2CnlPJ0FVXjQGY23Z9MfRhDeuBInszKWYfnyzaMYzCM1QEu9L3ADMktdlUR3uLnpvmmILJx9Nogv_6T0FZ4Czl8CZz0JjBDCu9amzq_3igvOBmetLSjnbS3sw6Zv127yqUYVBcNLgdi1lv563eT21w/yJVGRt31Y4j2y3qZnxgYE2N6Y-WSne8xUkQ3IrfEbR8"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-071",
    "createdAt": 71,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/MI_o2UJJZ2Vt5BtAGtqXXA/kS7Jn91l4vGKliB307j57ORht1Dh4Jz8r-DLndVEHoE2Jk-ob1ZPSRbj4DTNh-L27WYed0Uli6oAU3L9L2e3yLuOXxdTdfJdX1FAlaJ4BdrsL6QTzZHBCD-F3mgWA20d_pAUZ36OjhXDuuEo78HaLA/CKgL56aWbOm35M50E8ZV24QnXnmrTw9NAJoDAI5FE6w",
    "avatarChanged": true,
    "basic": {
      "vieName": "TRẦN THỊ MỸ TÂM",
      "engName": "Choocopie",
      "ydiId": "YDI0073",
      "haId": "ITO 1382",
      "sex": "女",
      "dateOfBirth": {
        "year": "2004",
        "month": "03",
        "day": "24"
      },
      "age": "22",
      "zodiac": "Aries ♈",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(076) 565- 2248"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(033) 425-7465"
      },
      "emergencyRelationship": {
        "preset": "DADDY",
        "other": ""
      },
      "email": "Vmt307474@gmail.com",
      "nationId": "079304023750",
      "placeOfOrigin": "Ba Trinh, Kế Sách, Sóc Trăng",
      "placeOfResidence": "Phạm Văn Cội, Củ Chi, Tp Hồ Chí Minh"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Service",
        "other": ""
      },
      "directBoss": "Chooco",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "03",
        "day": "17"
      },
      "probationDays": "60",
      "probEndDate": {
        "year": "2026",
        "month": "05",
        "day": "16"
      },
      "officialDate": {
        "year": "2026",
        "month": "05",
        "day": "17"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21033"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "0765652248",
      "bankName": "MB Bank",
      "probationSalary": "16000000",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-071",
          "name": "Chooco.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/ntNKXTMnmIWiZxmj0Iyv3Q/U2leWhybdjRzGyuU-QtG_Zdo_PCt1e5Gl1fJdm6--lwwZgbmhLMICzG1BgqnyiDLs8S_ecgJN5nZoWA6K0pvKzRI0v4RmNiyQspuUDK-Of5jEEg8tdbRC9mVkoOYtOmM2wjXcPHY81PNqAgfl_9CLxIxIvdJ4j0matOPeJSJZsQ/kDYhq-vjSa_ocAWSuoAqjZ5jtOcdLuvnPL008psiYIs"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-072",
    "createdAt": 72,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/LitnDNf-dWJ6OsXAUEPO5w/-AZ-cIjMgestkgNT97Fw_QAVttlc1D0rIZyedRFKs_mIzBD2gGqPrVcVCxR0PhAB3WyDJhVH1lHUkdNSgzq2nC5HT3FnCphFMR4Ln-MSWPgEWJdpMdPq_6Ntq2Sko_eq1lNyZ01pr6izOayMTPP83vpTp7kZwFfHfoRhiufApJnIWk8J1vW2ynW7hqnT9kZO/d6mvdLNyOGnGuQSP9jUxWhBUQAi4T3GI7zv_pJihDJI",
    "avatarChanged": true,
    "basic": {
      "vieName": "LÊ CÔNG TUẤN ANH",
      "engName": "Anh",
      "ydiId": "YDI0074",
      "haId": "ITO 1387",
      "sex": "男",
      "dateOfBirth": {
        "year": "1996",
        "month": "01",
        "day": "30"
      },
      "age": "30",
      "zodiac": "Aquarius ♒",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(093) 122-5752"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "tuanhqnam96@gmail.com",
      "nationId": "049096016664",
      "placeOfOrigin": "Cẩm Thanh, Tp Hội An, Quảng Nam",
      "placeOfResidence": "Cẩm Thanh, Tp Hội An, Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Driver",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21012"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-072",
          "name": "Anh.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/Aqi87A8kwtyuuk6dCtf3GQ/NSyBm-dYD74CTqFeJo9hPPJHUCCz0MNLCRHEU7L4dXv00Ny_C0bdbVgmf705D4FNp346mCy0CP03nNOqP1kWa9UcnhsCMMYFjfqWMVLjAWPWaNToVJo7dpWOuJzdHhChw9i5074Yot0SY8qvIT05GA/Wk0KsjpMrRrnKqnKytOMSxK8WgdimThb3WfHsiFz2Uc"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-073",
    "createdAt": 73,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/_BSO0SEpDAXx3yQNLpkxJA/i2GkXpFkBktBnp-I969M4EvBRt95ZupODjkNqAgPCaTZI0V8mp8mhmKYmKFOLBYjBY1LxnXv-_L1pBl2JRG78yUV_Bk_u6N0dbLbWCZ7CMkHaiLW0H9wvCSqjEhcRqh-DP05kuSy3gy9VjqcmBslurbo3tYMw2a83OMwin4CHhPsks4gjaIBKD6YQ-qPGQvg/faNlrCRwE6NuHhP9xC5hw3LPTVOX_Vi9N94wdLqtmqA",
    "avatarChanged": true,
    "basic": {
      "vieName": "PHAN NGỌC DŨNG",
      "engName": "Chod",
      "ydiId": "YDI0075",
      "haId": "ITO 1384",
      "sex": "男",
      "dateOfBirth": {
        "year": "1985",
        "month": "05",
        "day": "01"
      },
      "age": "40",
      "zodiac": "Taurus ♉",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(090) 577-6790"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "ngocdung22081982@gmail.com",
      "nationId": "049085015505",
      "placeOfOrigin": "Bảo An, Điện Quang, Điện Bàn, Quảng Nam",
      "placeOfResidence": "Bảo An, Điện Quang, Điện Bàn, Quảng Nam"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Driver",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "21231"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-073",
          "name": "Chod.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/PG-FDHdhcAEwucaahupfNA/OcZ33w3q2GZUINdpIVfe5eE6QpGe3dah_zH74noGxf6U4GRZBJ9kBBt31bzgkcNpZOuJxZgmxj0YGcrbZGsIJf6nWpV91S-EwhCx23tFfWmE-BvbJrsdgcxn4EVSTswyb1K16ufWsWOBWPfe01yujA/1UwH1OjeTMx9tM996dw9rNu2KdCiO1MipZMt_AhLDWU"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-074",
    "createdAt": 74,
    "departmentId": "dept-operation",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/T566OrdaS9IaeOuO6qbpNw/GyhKmENZpZI38xwU5EmD1zC4EKy6oGg_S3paE5oJtoCUS-tF9sjlyc2NOXqjoYaCBj-F1CSoDLk63bGQ_Kl18_knr_oLeCp0aSnrr_NP1QysDQl3FWqrdF6KWP51opprg9r7O8QkbatU53UoePnJ2A/1_EtYPqRhg0BQboIoPRMIYoE67g9nFTDE7RXY3UiVlM",
    "avatarChanged": true,
    "basic": {
      "vieName": "NGUYỄN LÊ XUÂN ANH",
      "engName": "Tiffany",
      "ydiId": "YDI0076",
      "haId": "ITO 1069",
      "sex": "女",
      "dateOfBirth": {
        "year": "2006",
        "month": "10",
        "day": "09"
      },
      "age": "19",
      "zodiac": "Libra ♎",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(078) 526- 8077"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(078) 556- 4300"
      },
      "emergencyRelationship": {
        "preset": "MOM",
        "other": ""
      },
      "email": "lexuananh9177@gmail.com",
      "nationId": "075306007399",
      "placeOfOrigin": "Vị Thanh, Vị thủy, Hậu giang",
      "placeOfResidence": "Phú xuân, Tân Phú, Đồng nai"
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Host",
        "other": ""
      },
      "directBoss": "Jimster",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "03",
        "day": "20"
      },
      "probationDays": "60",
      "probEndDate": {
        "year": "2026",
        "month": "05",
        "day": "19"
      },
      "officialDate": {
        "year": "2026",
        "month": "05",
        "day": "20"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": "10305"
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "18000000",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-075",
    "createdAt": 75,
    "departmentId": "dept-cage",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "Choco",
      "ydiId": "YDI0077",
      "haId": "",
      "sex": "女",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "China",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "中國 +86",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "中國 +86",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Supervisor",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-076",
    "createdAt": 76,
    "departmentId": "dept-booking-and-service",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/DMw8olxzkI62UqMGVk7DNQ/5nXIWLyzAWxSyFS1knRrkd3xyqmR-UVgQXVNu_kaqfS6xL8Yo12ReEaRs3OvouIamzcnrbmKfw0pM3CfTVd14gEe073YD53i6TrpzDkKztsG18dN3BsKYBTH-OPVTKqJYHl_vXKpctZPdTvJ_GnVvQ/jjQFpjtE5pvDznIp1c5fbND21w3VHXTAu9R-xXpeNgA",
    "avatarChanged": true,
    "basic": {
      "vieName": "MAI THỊ THANH NGA",
      "engName": "Tana",
      "ydiId": "YDI0078",
      "haId": "",
      "sex": "女",
      "dateOfBirth": {
        "year": "1995",
        "month": "08",
        "day": "23"
      },
      "age": "30",
      "zodiac": "Virgo ♍",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(090) 389-9997"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": "(093) 528-4778"
      },
      "emergencyRelationship": {
        "preset": "MOM",
        "other": ""
      },
      "email": "Maithithanhnga230895@gmail.com",
      "nationId": "048195008526",
      "placeOfOrigin": "Hòa Hải, Ngũ Hành Sơn, Đà Nẵng",
      "placeOfResidence": "Hòa Hải, Ngũ Hành Sơn, Đà Nẵng"
    },
    "work": {
      "department": {
        "preset": "Booking & Service",
        "other": ""
      },
      "position": "Staff",
      "titleJob": {
        "preset": "Service",
        "other": ""
      },
      "directBoss": "Candy",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "03",
        "day": "24"
      },
      "probationDays": "60",
      "probEndDate": {
        "year": "2026",
        "month": "05",
        "day": "23"
      },
      "officialDate": {
        "year": "2026",
        "month": "05",
        "day": "24"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "8804887904",
      "bankName": "BIDV",
      "probationSalary": "17000000",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-076",
          "name": "Tana.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/6un0QrkIG8GRCyhN6K608w/xV7xE7jFEVjTIeoeWJzRgbSqlf0Xq2tHJYSb2du5dawn4S4qT-164tCwunUlQGlDnbTM6IQo-PNgV3WIETJm4W3G3kQkQbeVclsm-19TC_RX7UsbMNVMlHZr2JINOjaw0AT4MoCLvfE3AD8NJZvu2g/iHEIro79qpP4t1baKV5iillrZE6o_vManQEEOV7VBtc"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-077",
    "createdAt": 77,
    "departmentId": "dept-cage",
    "avatarSrc": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/UjbD1etJiBDjTgSR9FO5AQ/SNn8D8eLAzBL7hFBgIrJLZPAyhI84Ai1wBxBRIIqaPK0aXKLWDZUE0NL39rL_Pn2sNgdz6b8Kr3aSfBRxakpColRLS6GMga9L7vaEx0Aj9v7M1BYp5qgbR9UZGl8328nPrM9sSdqD_sKw9bT1q4xanCxeO0AzBP4q6M7ygg5Qw5BlFHJafygsGAZEBwk9IEy/lcgBgmbAeZ80Fm8BZhW6dotqORnmg0JW3hkg_uQBnCY",
    "avatarChanged": true,
    "basic": {
      "vieName": "LÊ QUANG TÙNG",
      "engName": "RICHARD",
      "ydiId": "YDI0079",
      "haId": "",
      "sex": "男",
      "dateOfBirth": {
        "year": "1996",
        "month": "07",
        "day": "19"
      },
      "age": "29",
      "zodiac": "Cancer ♋",
      "nationality": "Vietnam",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": "(079) 579-7438"
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "051096014262",
      "placeOfOrigin": "Nghĩa Trung, Tư Nghĩa, Quảng Ngãi",
      "placeOfResidence": "Nghĩa Trung, Tư Nghĩa, Quảng Ngãi"
    },
    "work": {
      "department": {
        "preset": "Cage",
        "other": ""
      },
      "position": "Supervisor",
      "titleJob": {
        "preset": "Cage",
        "other": ""
      },
      "directBoss": "Ken",
      "recruitmentDept": "Internal",
      "status": "在職",
      "onboardDate": {
        "year": "2026",
        "month": "04",
        "day": "01"
      },
      "probationDays": "60",
      "probEndDate": {
        "year": "2026",
        "month": "05",
        "day": "31"
      },
      "officialDate": {
        "year": "2026",
        "month": "01",
        "day": "06"
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "30000000",
      "officialSalary": ""
    },
    "other": {
      "attachments": [
        {
          "id": "attachment-077",
          "name": "Richard.pdf",
          "data": "https://v5.airtableusercontent.com/v3/u/51/51/1774922400000/O6fEQ2E2gMva45f4rGT7WA/_N3EkFHj7l7I9bG7EQPP0ymsskP6Rp31ZSGPUYxtl96uvmLae2soYMrTFagzFRPi0AujrM9mPR0_T9CaJTX0NwMl8p0af95jZJHNa7GUBi3qbk8YLEFznlHfnQvb6jYhZjb5ieSYQzy4SmHBTC9EnrGHYP60oQMIxxw76mb35w4/W8wmkgXt8AMK6UpepJFD9cma-E0YDl3ywwmm6wCwdVA"
        }
      ],
      "remark": ""
    }
  },
  {
    "id": "employee-078",
    "createdAt": 78,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-079",
    "createdAt": 79,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-080",
    "createdAt": 80,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-081",
    "createdAt": 81,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-082",
    "createdAt": 82,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-083",
    "createdAt": 83,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-084",
    "createdAt": 84,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-085",
    "createdAt": 85,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-086",
    "createdAt": 86,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-087",
    "createdAt": 87,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-088",
    "createdAt": 88,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-089",
    "createdAt": 89,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-090",
    "createdAt": 90,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-091",
    "createdAt": 91,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-092",
    "createdAt": 92,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-093",
    "createdAt": 93,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-094",
    "createdAt": 94,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-095",
    "createdAt": 95,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-096",
    "createdAt": 96,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-097",
    "createdAt": 97,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-098",
    "createdAt": 98,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-099",
    "createdAt": 99,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-100",
    "createdAt": 100,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-101",
    "createdAt": 101,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  },
  {
    "id": "employee-102",
    "createdAt": 102,
    "departmentId": "dept-operation",
    "avatarSrc": "../image/logo.png",
    "avatarChanged": false,
    "basic": {
      "vieName": "",
      "engName": "",
      "ydiId": "",
      "haId": "",
      "sex": "",
      "dateOfBirth": {
        "year": "",
        "month": "",
        "day": ""
      },
      "age": "",
      "zodiac": "",
      "nationality": "",
      "language": ""
    },
    "contact": {
      "phoneNumber": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyPhone": {
        "countryCode": "越南 +84",
        "number": ""
      },
      "emergencyRelationship": {
        "preset": "其他",
        "other": ""
      },
      "email": "",
      "nationId": "",
      "placeOfOrigin": "",
      "placeOfResidence": ""
    },
    "work": {
      "department": {
        "preset": "Operation",
        "other": ""
      },
      "position": "",
      "titleJob": {
        "preset": "Head of Operation",
        "other": ""
      },
      "directBoss": "",
      "recruitmentDept": "",
      "status": "在職",
      "onboardDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "probationDays": "",
      "probEndDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "officialDate": {
        "year": "",
        "month": "",
        "day": ""
      },
      "roomNumber": {
        "type": "員工宿舍",
        "value": ""
      },
      "lastDay": {
        "year": "",
        "month": "",
        "day": ""
      }
    },
    "bank": {
      "bankNumber": "",
      "bankName": "",
      "probationSalary": "",
      "officialSalary": ""
    },
    "other": {
      "attachments": [],
      "remark": ""
    }
  }
];

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createEmptyDateParts() {
    return { year: "", month: "", day: "" };
  }

  function createTodayDateParts() {
    const now = new Date();

    return {
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1).padStart(2, "0"),
      day: String(now.getDate()).padStart(2, "0")
    };
  }

  function createEmptyEmployeeDraft(departmentName) {
    const today = createTodayDateParts();

    return {
      id: "",
      createdAt: 0,
      departmentId: "",
      avatarSrc: DEFAULT_IMAGE_SRC,
      avatarChanged: false,
      basic: {
        vieName: "",
        engName: "",
        ydiId: "",
        haId: "",
        sex: "",
        dateOfBirth: cloneValue(today),
        age: "",
        zodiac: "",
        nationality: "",
        language: ""
      },
      contact: {
        phoneNumber: { countryCode: PHONE_COUNTRY_OPTIONS[0], number: "" },
        emergencyPhone: { countryCode: PHONE_COUNTRY_OPTIONS[0], number: "" },
        emergencyRelationship: { preset: RELATIONSHIP_OPTIONS[0], other: "" },
        email: "",
        nationId: "",
        placeOfOrigin: "",
        placeOfResidence: ""
      },
      work: {
        department: { preset: departmentName || "", other: "" },
        position: POSITION_OPTIONS[0] || "",
        titleJob: { preset: TITLE_JOB_OPTIONS[0] || "", other: "" },
        directBoss: "",
        recruitmentDept: "",
        status: "在職",
        onboardDate: cloneValue(today),
        probationDays: "",
        probEndDate: cloneValue(today),
        officialDate: cloneValue(today),
        roomNumber: { type: "員工宿舍", value: "" },
        lastDay: cloneValue(today)
      },
      bank: {
        bankNumber: "",
        bankName: "",
        probationSalary: "",
        officialSalary: ""
      },
      other: {
        attachments: [],
        remark: ""
      }
    };
  }

  function createInitialTabsByDepartment() {
    return DEFAULT_DEPARTMENTS.reduce(function (result, department) {
      result[department.id] = [];
      return result;
    }, {});
  }

  function createInitialState() {
    return {
      interfaceMeta: {
        title: DEFAULT_INTERFACE_TITLE,
        subtitle: DEFAULT_INTERFACE_SUBTITLE,
        iconSrc: DEFAULT_IMAGE_SRC,
        customIcon: false
      },
      departments: cloneValue(DEFAULT_DEPARTMENTS),
      selectedDepartmentId: DEFAULT_DEPARTMENTS[0].id,
      tabsByDepartment: createInitialTabsByDepartment(),
      activeTabByDepartment: {},
      employees: cloneValue(SEED_EMPLOYEES),
      cardDisplay: {
        titleField: "engName",
        extraFieldIds: ["vieName", "position"]
      },
      sortMode: "createdAsc",
      searchQuery: "",
      filters: {
        position: "全部",
        status: "全部"
      }
    };
  }

  window.YiDingEmployeesData = {
    DEFAULT_INTERFACE_TITLE: DEFAULT_INTERFACE_TITLE,
    DEFAULT_INTERFACE_SUBTITLE: DEFAULT_INTERFACE_SUBTITLE,
    DEFAULT_IMAGE_SRC: DEFAULT_IMAGE_SRC,
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_DEPARTMENTS: DEFAULT_DEPARTMENTS,
    RETIRED_DEPARTMENT: RETIRED_DEPARTMENT,
    BASE_DEPARTMENT_OPTIONS: BASE_DEPARTMENT_OPTIONS,
    POSITION_OPTIONS: POSITION_OPTIONS,
    TITLE_JOB_OPTIONS: TITLE_JOB_OPTIONS,
    SEX_OPTIONS: SEX_OPTIONS,
    STATUS_OPTIONS: STATUS_OPTIONS,
    RELATIONSHIP_OPTIONS: RELATIONSHIP_OPTIONS,
    ROOM_TYPE_OPTIONS: ROOM_TYPE_OPTIONS,
    PHONE_COUNTRY_OPTIONS: PHONE_COUNTRY_OPTIONS,
    SORT_OPTIONS: SORT_OPTIONS,
    CARD_FIELD_OPTIONS: CARD_FIELD_OPTIONS,
    SEED_EMPLOYEES: SEED_EMPLOYEES,
    cloneValue: cloneValue,
    createEmptyDateParts: createEmptyDateParts,
    createTodayDateParts: createTodayDateParts,
    createEmptyEmployeeDraft: createEmptyEmployeeDraft,
    createInitialState: createInitialState
  };
})();
